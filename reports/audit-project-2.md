# Audit: ecommerce-api-legacy

## Detection

Node.js / Express / SQLite LMS checkout domain. Initial architecture was an `AppManager` god object that created the database, declared routes, performed validation, payment decisions, persistence, logging, and reporting. Initial runtime count: 3 JavaScript files plus package metadata. Endpoint inventory: `POST /api/checkout`, `GET /api/admin/financial-report`, and `DELETE /api/users/:id`.

## Findings

| Severity | Location | Anti-pattern | Impact | Remediation | Status |
|---|---|---|---|---|---|
| CRITICAL | `src/utils.js:1-6` | Live-looking gateway/database credentials committed | Source disclosure becomes credential compromise. | Environment-backed configuration with development fallback. | Resolved |
| CRITICAL | `src/AppManager.js:45-47` | Card number logged with gateway key | Payment data and credential leakage. | Never log card data; keep gateway configuration out of logs. | Resolved |
| HIGH | `src/AppManager.js:26-93` | Checkout route owns payment, user creation, enrollment, and audit writes | Partial writes and duplicated retry effects. | Extract `CheckoutService` and repository boundary. | Resolved |
| HIGH | `src/AppManager.js:105-134` | Nested asynchronous N+1 financial report | Slow and difficult-to-fail deterministically. | Isolate reporting query/service for later optimization. | Documented |
| MEDIUM | `src/AppManager.js:95-102` | Destructive user delete ignores dependent records | Orphaned enrollments and payments. | Use transaction/cascade policy in repository. | Documented |
| MEDIUM | `src/utils.js:16-23` | Homemade base64 repetition used as password hash | Weak credential protection. | Use a vetted password hash in the service layer. | Documented |
| LOW | `src/app.js:8` | App always listens during import | Tests cannot import the app without binding a port. | Export app and listen only as main module. | Resolved |
| LOW | `src/utils.js:10-14` | Global mutable cache and unused revenue state | Hidden cross-request state and misleading ownership. | Inject cache adapter and remove dead state incrementally. | Partially resolved |

## Endpoint contract

`POST /api/checkout`, `GET /api/admin/financial-report`, and `DELETE /api/users/:id` remain unchanged. Checkout still returns `{msg, enrollment_id}` with status 200 on approved cards and the same 400/404/500 messages on representative failures.

## Validation

| Check | Command | Result |
|---|---|---|
| Syntax | `node --check src/app.js; node --check src/AppManager.js; node --check src/services/checkoutService.js` | Pass |
| Boot | `PORT=3102 node src/app.js` | Pass; listener started |
| Checkout smoke | HTTP JSON request with seeded course and Visa-like card | Pass; 200 and enrollment id |
| Rejection smoke | HTTP JSON request with non-Visa-like card | Pass; 400 |

## Approval

Human approval: challenge execution approval recorded by task request.

