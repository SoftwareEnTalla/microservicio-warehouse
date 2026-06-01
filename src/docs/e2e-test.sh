#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Test E2E — warehouse-service
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3010/api}"
# ── Auth bootstrap: login real contra security-service ─────────
SECURITY_BASE_URL="${SECURITY_BASE_URL:-http://localhost:3015/api}"
SA_EMAIL="${SA_EMAIL:-softwarentalla@gmail.com}"
SA_PWD="${SA_PWD:-admin123}"
__login_resp=$(curl -s -w "\n%{http_code}" -X POST "$SECURITY_BASE_URL/logins/command" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$SA_EMAIL\",\"password\":\"$SA_PWD\"}" 2>/dev/null)
__login_code=$(echo "$__login_resp" | tail -n1)
if [[ "$__login_code" != "200" && "$__login_code" != "201" ]]; then
  echo "✘ Auth bootstrap falló: HTTP $__login_code contra $SECURITY_BASE_URL/logins/command"
  exit 1
fi
__token=$(echo "$__login_resp" | sed '$d' | (jq -r '.accessToken // .data.accessToken // .token // empty' 2>/dev/null || echo ""))
[[ -z "$__token" ]] && { echo "✘ Auth bootstrap: respuesta sin accessToken"; exit 1; }
AUTH="Bearer $__token"
echo "  ✔ Auth bootstrap: token JWT obtenido para $SA_EMAIL"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'; BLUE='\033[0;34m'
PASS=0; FAIL=0; TOTAL=0; WARN=0
log_step() { echo -e "\n${BLUE}═══ PASO $1: $2 ═══${NC}"; }
log_ok()   { echo -e "  ${GREEN}✔ $1${NC}"; PASS=$((PASS+1)); TOTAL=$((TOTAL+1)); }
log_fail() { echo -e "  ${RED}✘ $1${NC}"; FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1)); }
log_warn() { echo -e "  ${YELLOW}⚠ $1${NC}"; WARN=$((WARN+1)); }
do_post()   { curl -s -w "\n%{http_code}" -X POST   "$1" -H "Content-Type: application/json" -H "Authorization: $AUTH" -d "$2" 2>/dev/null; }
do_put()    { curl -s -w "\n%{http_code}" -X PUT    "$1" -H "Content-Type: application/json" -H "Authorization: $AUTH" -d "$2" 2>/dev/null; }
do_get()    { curl -s -w "\n%{http_code}" -X GET    "$1" -H "Authorization: $AUTH" 2>/dev/null; }
do_delete() { curl -s -w "\n%{http_code}" -X DELETE "$1" -H "Authorization: $AUTH" 2>/dev/null; }
extract_body() { echo "$1" | sed '$d'; }
extract_code() { echo "$1" | tail -n1; }
json_get() { echo "$1" | jq -r "$2" 2>/dev/null || echo ""; }

UNIQUE="$(date +%s)"
NOW="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
WAREHOUSE_CODE="WH-$UNIQUE"
ORGANIZATION_ID="11111111-1111-4111-8111-111111111111"


echo -e "${BLUE}╔═ TEST E2E — Warehouse Microservice ═╗${NC}"
echo -e "  Base URL: $BASE_URL | Unique: $UNIQUE"

log_step 0 "Pre-flight"
RESP=$(do_get "$BASE_URL/warehouses/query/count")
CODE=$(extract_code "$RESP")
[[ "$CODE" =~ ^(200|201)$ ]] && log_ok "Service UP ($CODE)" || { log_fail "NO responde ($CODE)"; exit 1; }

INITIAL_COUNT=$(extract_body "$RESP" | tr -d '[:space:]')
[[ -n "$INITIAL_COUNT" ]] || INITIAL_COUNT="0"

log_step 1 "Crear warehouse"
PAYLOAD=$(cat <<JSON
{"name":"WH-$UNIQUE","warehouseCode":"$WAREHOUSE_CODE","organizationId":"$ORGANIZATION_ID","status":"ACTIVE","timezone":"America/Havana","capacityUnits":120,"dockCount":4,"slottingStrategy":"FIFO","metadata":{"origin":"e2e","unique":"$UNIQUE"},"creationDate":"$NOW","modificationDate":"$NOW","createdBy":"e2e","isActive":true}
JSON
)
RESP=$(do_post "$BASE_URL/warehouses/command" "$PAYLOAD")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
WH_ID=$(json_get "$BODY" '.data.id // .id // empty')
[[ "$CODE" =~ ^(200|201)$ && -n "$WH_ID" ]] && log_ok "Created id=$WH_ID" || { log_fail "Create failed ($CODE)"; exit 1; }

log_step 2 "Get by id"
RESP=$(do_get "$BASE_URL/warehouses/query/$WH_ID")
CODE=$(extract_code "$RESP")
[[ "$CODE" == "200" ]] && log_ok "Got warehouse" || log_fail "Get failed ($CODE)"

log_step 3 "List"
RESP=$(do_get "$BASE_URL/warehouses/query/list?page=1&size=10")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
LIST_COUNT=$(json_get "$BODY" '.count // 0')
[[ "$CODE" == "200" ]] && log_ok "List ok (count=$LIST_COUNT)" || log_fail "List failed ($CODE)"

log_step 4 "Field search"
RESP=$(do_get "$BASE_URL/warehouses/query/field/warehouseCode?value=$WAREHOUSE_CODE")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
MATCHED_ID=$(json_get "$BODY" '.data[0].id // empty')
[[ "$CODE" == "200" && -n "$MATCHED_ID" ]] && log_ok "Search by field ok" || log_fail "Field search failed ($CODE)"

log_step 5 "Update warehouse"
UPDATE_PAYLOAD=$(cat <<JSON
{"id":"$WH_ID","name":"WH-$UNIQUE updated","warehouseCode":"$WAREHOUSE_CODE","organizationId":"$ORGANIZATION_ID","status":"ACTIVE","timezone":"America/Havana","capacityUnits":150,"dockCount":6,"slottingStrategy":"LIFO","metadata":{"origin":"e2e","updated":true,"unique":"$UNIQUE"},"creationDate":"$NOW","modificationDate":"$NOW","createdBy":"e2e","isActive":true}
JSON
)
RESP=$(do_put "$BASE_URL/warehouses/command/$WH_ID" "$UPDATE_PAYLOAD")
CODE=$(extract_code "$RESP")
[[ "$CODE" =~ ^(200|201)$ ]] && log_ok "Updated" || log_fail "Update failed ($CODE)"

log_step 6 "Verify update"
RESP=$(do_get "$BASE_URL/warehouses/query/$WH_ID")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
UPDATED_CAPACITY=$(json_get "$BODY" '.data.capacityUnits // empty')
UPDATED_SLOT=$(json_get "$BODY" '.data.slottingStrategy // empty')
if [[ "$CODE" == "200" && "$UPDATED_CAPACITY" == "150" && "$UPDATED_SLOT" == "LIFO" ]]; then
  log_ok "Update persisted"
else
  log_fail "Updated values no coinciden (HTTP $CODE, capacity=$UPDATED_CAPACITY, slotting=$UPDATED_SLOT)"
fi

log_step 7 "Delete"
RESP=$(do_delete "$BASE_URL/warehouses/command/$WH_ID")
CODE=$(extract_code "$RESP")
[[ "$CODE" =~ ^(200|204)$ ]] && log_ok "Deleted" || log_fail "Delete failed ($CODE)"

log_step 8 "Count after delete"
RESP=$(do_get "$BASE_URL/warehouses/query/count")
CODE=$(extract_code "$RESP")
AFTER_COUNT=$(extract_body "$RESP" | tr -d '[:space:]')
if [[ "$CODE" =~ ^(200|201)$ && "$AFTER_COUNT" =~ ^[0-9]+$ ]]; then
  log_ok "Count ok ($INITIAL_COUNT -> $AFTER_COUNT)"
else
  log_fail "Count after delete failed ($CODE)"
fi

echo -e "\n${BLUE}╔══ RESUMEN ══╗${NC}"
echo -e "  Total: $TOTAL  ${GREEN}✔ OK: $PASS${NC}  ${RED}✘ FAIL: $FAIL${NC}  ${YELLOW}⚠ WARN: $WARN${NC}"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
