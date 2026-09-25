#!/bin/bash
# AFTER-FIX verification for Vuln #3 (IDOR, CWE-639). Run with the backend running on :3001.
# Signs test JWTs locally with SECRET_KEY from backend/.env. Read-only: every mutating request
# is either rejected (401/403) or aimed at a non-existent / non-cancellable record.
cd "$(dirname "$0")/../../../backend" || exit 1
B=${API:-http://localhost:3001/api}   # override with API=http://localhost:3002/api to test a second instance
tok(){ node -e "require('dotenv').config();console.log(require('jsonwebtoken').sign({id:$1,role:'$2'},process.env.SECRET_KEY,{expiresIn:'10m'}))"; }
OWNER=$(tok 2 customer)        # owns order 2
ATTACKER=$(tok 999 customer)   # a different customer
ATTACK_DEL=$(tok 999 deliver)  # a deliver with no assignment to order 2
ADMIN=$(tok 1 admin)
NID=6ab25c0196f0c258e96ad3c0   # a real notification belonging to user 2
# SAFETY GUARD: several requests below are mutations that only appear safe if the patched auth is active.
# Abort unless an unauthenticated read is rejected, so this can never modify data on an unpatched server.
guard=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "$B/orders/2")
if [ "$guard" != "401" ]; then echo "ABORT: $B is not enforcing authentication (got $guard, expected 401). Restart the backend with the patched code."; exit 2; fi
pass=0; fail=0
t(){ # name expected_code token method path [json body]
  local hdr=(); [ -n "$3" ] && hdr=(-H "Authorization: Bearer $3")
  local args=(-s -m 10 -o /tmp/body.$$ -w '%{http_code}' -X "$4" "${hdr[@]}")
  [ -n "$6" ] && args+=(-H 'Content-Type: application/json' -d "$6")
  code=$(curl "${args[@]}" "$B$5")
  if [ "$code" = "$2" ]; then pass=$((pass+1)); r=PASS; else fail=$((fail+1)); r=FAIL; fi
  printf '%-4s expect %s got %s  %-9s %s %s\n' $r $2 $code "$1" "$4" "$5"
}
echo "--- No token -> 401"
t none 401 "" GET /orders/2; t none 401 "" GET /orders/user/2; t none 401 "" GET /orders/user/summary/2
t none 401 "" GET /cart/getcart/2; t none 401 "" GET /notifications/user/2; t none 401 "" PUT /orders/cancel/999999
t none 401 "" PUT /orders/update/999999 '{"status":"shipped"}'; t none 401 "" DELETE /notifications/$NID; t none 401 "" GET /orders/all
t forged 401 "not.a.jwt" GET /orders/2
echo "--- Authenticated attacker (customer 999) -> 403"
t attacker 403 $ATTACKER GET /orders/2; t attacker 403 $ATTACKER GET /orders/user/2; t attacker 403 $ATTACKER GET /orders/user/summary/2
t attacker 403 $ATTACKER GET /cart/getcart/2; t attacker 403 $ATTACKER GET /notifications/user/2
t attacker 403 $ATTACKER DELETE /notifications/user/2; t attacker 403 $ATTACKER DELETE /notifications/$NID
t attacker 403 $ATTACKER PUT /orders/cancel/2; t attacker 403 $ATTACKER PUT /cart/updatetotalprice '{"user_id":2,"total_price":1}'
t attacker 403 $ATTACKER PUT /cart/updatecartitem '{"user_id":2,"product_id":1,"quantity":9}'
t attacker 403 $ATTACKER DELETE /cart/clearcart/2; t attacker 403 $ATTACKER GET /orders/424242
echo "--- Role enforcement (customer on admin routes, unassigned deliver) -> 403"
t customer 403 $OWNER GET /orders/all; t customer 403 $OWNER GET /orders/analytics; t customer 403 $OWNER PUT /orders/update/2 '{"status":"cancelled"}'
t deliver 403 $ATTACK_DEL GET /orders/2
echo "--- Legitimate owner -> 200"
t owner 200 $OWNER GET /orders/2; t owner 200 $OWNER GET /orders/user/2; t owner 200 $OWNER GET /orders/user/summary/2
t owner 200 $OWNER GET /cart/getcart/2; t owner 200 $OWNER GET /notifications/user/2
t owner 403 $OWNER GET /orders/user/3
echo "--- Admin -> allowed"
t admin 200 $ADMIN GET /orders/all; t admin 200 $ADMIN GET /orders/2; t admin 200 $ADMIN GET /orders/analytics; t admin 200 $ADMIN GET /orders/user/2
t admin 404 $ADMIN PUT /orders/update/999999 '{"status":"shipped"}'
echo; echo "Result: $pass passed, $fail failed"; rm -f /tmp/body.$$; [ $fail -eq 0 ]
