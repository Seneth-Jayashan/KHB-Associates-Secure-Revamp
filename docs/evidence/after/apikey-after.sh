#!/bin/bash
# AFTER-FIX verification for CWE-798 (hard-coded Gemini API key in the frontend).
# SAFE BY DESIGN: never uses or prints the real key. It starts two throwaway backend instances on
# ports 3003/3004 with GEMINI_API_KEY forced to "" (missing key) and to a dummy value; dotenv does not
# override variables that are already set, so the real key in backend/.env is never loaded.
# Run from anywhere. Set SKIP_BUILD=1 to skip the (slow) production-bundle scan.
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"; cd "$ROOT" || exit 1
pass=0; fail=0
chk(){ # description expected actual
  if [ "$2" = "$3" ]; then pass=$((pass+1)); r=PASS; else fail=$((fail+1)); r=FAIL; fi
  printf '%-4s %-62s expected=%-4s actual=%s\n' $r "$1" "$2" "$3"; }
KEYRE='AIza[A-Za-z0-9_-]{20,}'

echo "=== 1. Source scan (frontend/src)"
chk "frontend/src contains an AIza key"                    0 "$(grep -rE 'AIza' frontend/src | wc -l)"
chk "frontend/src references generativelanguage.googleapis" 0 "$(grep -rn 'generativelanguage' frontend/src | wc -l)"
chk "frontend/src contains a '?key=' query parameter"       0 "$(grep -rnE '[?&]key=' frontend/src | wc -l)"
chk "Chatbot.js calls the backend proxy endpoint"           1 "$(grep -c 'api/chatbot/message' frontend/src/Chatbot/Chatbot.js)"

echo "=== 2. Repository scan"
chk "files in repo containing a real-looking Google key"    0 "$(grep -rlE "$KEYRE" . --exclude-dir=node_modules --exclude-dir=.git | wc -l)"
chk "tracked files (HEAD) containing the old key"    0 "$(git grep -lE 'AIza[A-Za-z0-9_-]{20,}' | wc -l)"
chk "backend/.env is tracked by git"                        0 "$(git ls-files backend/.env | wc -l)"
chk "backend/.env is git-ignored (1=yes)"                   1 "$(git check-ignore -q backend/.env && echo 1 || echo 0)"
chk "backend/.env.example GEMINI_API_KEY value length"      0 "$(awk -F= '/^GEMINI_API_KEY/{print length($2)}' backend/.env.example)"
echo "NOTE: the old key still exists in git history (commits listed below); it is inert only once rotated/revoked."
git log --all --oneline -G'AIza[A-Za-z0-9_-]{20,}' | sed 's/^/      history: /'

echo "=== 3. Backend proxy behaviour (isolated instances, real key NOT loaded)"
cd backend || exit 1
GEMINI_API_KEY="" PORT=3003 node server.js >/dev/null 2>&1 & P1=$!
GEMINI_API_KEY=FAKE_DUMMY_KEY_zz9911 PORT=3004 node server.js >/tmp/apikey-dummy.log 2>&1 & P2=$!
trap 'kill $P1 $P2 2>/dev/null' EXIT
for i in $(seq 1 30); do curl -s -o /dev/null -m 2 -X POST http://localhost:3003/api/chatbot/message && curl -s -o /dev/null -m 2 -X POST http://localhost:3004/api/chatbot/message && break; sleep 1; done
post(){ curl -s -m 30 -o /tmp/apikey-body.$$ -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "$2" http://localhost:$1/api/chatbot/message; }
LONG=$(head -c 501 /dev/zero | tr '\0' 'a')
chk "missing message -> 400"                     400 "$(post 3003 '{}')"
chk "non-string message -> 400"                  400 "$(post 3003 '{"message":123}')"
chk "oversized message (501 chars) -> 400"       400 "$(post 3003 "{\"message\":\"$LONG\"}")"
chk "valid message, GEMINI_API_KEY missing -> 503" 503 "$(post 3003 '{"message":"hello"}')"
codes=""; for i in $(seq 1 12); do codes="$codes $(post 3003 '{"message":"burst"}')"; done
chk "rate limit: 429 returned within a 12-request burst" 1 "$(echo $codes | grep -c 429)"
echo "      burst status codes:$codes"
chk "rate-limit headers present on 429 (1=yes)"  1 "$(curl -s -i -X POST -H 'Content-Type: application/json' -d '{"message":"x"}' http://localhost:3003/api/chatbot/message | grep -ci '^ratelimit-limit')"
chk "dummy key -> Google rejects -> generic 502" 502 "$(post 3004 '{"message":"hello"}')"
curl -s -i -X POST -H 'Content-Type: application/json' -d '{"message":"hi"}' http://localhost:3004/api/chatbot/message > /tmp/apikey-full.$$
chk "dummy key present in response body/headers"  0 "$(grep -c FAKE_DUMMY_KEY_zz9911 /tmp/apikey-full.$$)"
chk "dummy key present in server log"             0 "$(grep -c FAKE_DUMMY_KEY_zz9911 /tmp/apikey-dummy.log)"
echo "      response body: $(sed -n '$p' /tmp/apikey-full.$$)"
echo "      server log   : $(grep -E 'chatbot' /tmp/apikey-dummy.log | head -1)"
kill $P1 $P2 2>/dev/null; cd "$ROOT"

if [ -z "$SKIP_BUILD" ]; then
  echo "=== 4. Production bundle scan"
  OUT="$(cygpath -m "$(mktemp -d)" 2>/dev/null || mktemp -d)"
  ( cd frontend && CI=false BUILD_PATH="$OUT" npm run build >/tmp/apikey-build.$$ 2>&1 ); 
  chk "frontend production build succeeded (1=yes)"       1 "$(grep -c 'ready to be deployed' /tmp/apikey-build.$$)"
  chk "bundle files containing an AIza key"               0 "$(grep -rlE "$KEYRE" "$OUT" | wc -l)"
  chk "bundle files containing an AQ.-style key"          0 "$(grep -rlE 'AQ\.[A-Za-z0-9_-]{30,}' "$OUT" | wc -l)"
  chk "bundle files referencing generativelanguage"       0 "$(grep -rl 'generativelanguage' "$OUT" | wc -l)"
  chk "bundle files referencing x-goog-api-key"           0 "$(grep -rl 'x-goog-api-key' "$OUT" | wc -l)"
  chk "bundle references the backend proxy endpoint (>=1)" 1 "$([ "$(grep -rl 'api/chatbot/message' "$OUT" | wc -l)" -ge 1 ] && echo 1 || echo 0)"
  rm -rf "$OUT"
fi
echo; echo "Result: $pass passed, $fail failed"; rm -f /tmp/apikey-*.$$ /tmp/apikey-dummy.log; [ $fail -eq 0 ]
