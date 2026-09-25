#!/bin/bash
# BEFORE-FIX evidence for CWE-798 (Gemini API key hard-coded in the frontend).
# The vulnerable code no longer exists in the working tree, so this reads the ORIGINAL code straight
# from git (initial commit 822ee37). All output is passed through a redactor: the key is never printed.
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"; cd "$ROOT" || exit 1
ORIG=822ee37
redact(){ sed -E 's/AIza[A-Za-z0-9_-]{10,}/AIza<REDACTED>/g'; }

{
echo "### Vuln #10 BEFORE-FIX evidence (CWE-798) - original code at commit $ORIG"; echo
echo "## 1. Key hardcoded in client source (frontend/src/Chatbot/Chatbot.js)"
git show $ORIG:frontend/src/Chatbot/Chatbot.js | grep -n "AIza"; echo
echo "## 2. Occurrences across frontend/src + backend in the original commit (excluding node_modules)"
git grep -nE "AIza" $ORIG -- 'frontend/src' 'backend' ':!*node_modules*'; echo
echo "## 3. Key is present in git history (commits that add/remove it in the chatbot file)"
git log --oneline -G'AIza[A-Za-z0-9_-]{20,}' -- frontend/src/Chatbot/Chatbot.js; echo
echo "## 4. The browser sends the key to Google in the URL query string (visible in DevTools > Network):"
echo "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIza<REDACTED>"; echo
echo "## 5. The call is made directly from the browser (no backend involved):"
git show $ORIG:frontend/src/Chatbot/Chatbot.js | sed -n '57,64p'
} 2>&1 | redact
