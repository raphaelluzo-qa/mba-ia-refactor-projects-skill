# Audit: ecommerce-api-legacy

## Detection

Node.js 22.21 / Express 4 / SQLite in-memory LMS checkout API. The application contains six JavaScript runtime modules (`src/AppManager.js`, `src/app.js`, `src/config.js`, `src/repositories/courseRepository.js`, `src/services/checkoutService.js`, and `src/utils.js`) plus `package.json` and `package-lock.json`; runtime module count for this pass was 6 before and 6 after. Inventory command: `Get-ChildItem 'ecommerce-api-legacy\src' -File -Filter '*.js' -Recurse | Measure-Object`.

`src/app.js` initializes an `AppManager`, which owns the SQLite connection and registers three routes. Checkout delegates to `CheckoutService`, which uses `CourseRepository` for course lookup. The financial-report and delete handlers still perform persistence directly in `AppManager`.

No deprecated Node/Express API was identified in the six reviewed runtime modules.

Endpoint inventory: `POST /api/checkout`, `GET /api/admin/financial-report`, and `DELETE /api/users/:id`.

The previous report marked credentials in `src/utils.js` resolved, although they were still embedded there. This pass removes those literals and the fixed payment-key fallback. The prior report also claimed payment-card and gateway-key logging; that behavior was not present in the current source, so it is not treated as a verified finding or as a fix.

## Findings

| Severity | Location | Anti-pattern | Impact | Remediation | Status |
|---|---|---|---|---|---|
| CRITICAL | `src/utils.js:1-6` before; `src/config.js:1-8` after | Database, payment, and mail configuration included fixed credential values | Source disclosure could expose external services. | Centralize configuration and read credentials from environment or a secret manager without fixed credential fallbacks. | Resolved: `utils.js` no longer exports credential values; config reads `DB_USER`, `DB_PASSWORD`, `PAYMENT_GATEWAY_KEY`, and `SMTP_USER` from the environment. |
| HIGH | `src/AppManager.js:27-36`; `src/services/checkoutService.js:1-31` | Checkout responsibilities were mixed into route handling; service extraction is partial | Business logic and persistence remain coupled to the route-owning manager. | Keep route handlers transport-only and move checkout persistence orchestration behind repository methods. | Open: validation, payment decision, and user/enrollment writes are in the service, but database operations remain service-owned. |
| HIGH | `src/AppManager.js:38-86` | Financial report performs nested asynchronous per-course/per-enrollment queries | Query count grows with the data set and callback failures can leave the response incomplete. | Replace nested loops with a bounded aggregate query and explicit error handling in a reporting service/repository. | Open. |
| MEDIUM | `src/AppManager.js:89-94` | User deletion ignores related enrollment and payment records | Deletion can leave orphaned business records. | Define and implement a transaction/cascade or reject deletion when dependent records exist. | Open. |
| MEDIUM | `src/services/checkoutService.js:1,6-7,26`; `src/utils.js:1-17` | Checkout accepted an absent password via a predictable fallback; the old homemade hash helper was not suitable for password storage | New accounts could receive a known password and stored credentials were not protected. | Require a string password and store a salted, adaptive password hash. | Resolved for checkout writes: missing/non-string password returns 400, fixed demo password seeds are removed, and new passwords use Node `scrypt` with per-password random salt. There is no password-login endpoint to validate hashes against. |
| LOW | `src/app.js:12` | Application listener starts only when run as the main module | Importing the application no longer binds a port, enabling isolated tests. | Keep this guard in place. | Resolved: importing `src/app.js` in the endpoint test did not require a fixed listener port. |
| LOW | `src/utils.js:3-4,17` | Global mutable cache and unused revenue state remain | Cross-request state has unclear ownership and the revenue variable is misleading. | Inject a bounded cache adapter or remove unused state when consumers are migrated. | Open. |

## Endpoint contract

| Method and path | Before/after evidence |
|---|---|
| `POST /api/checkout` | Approved-card request retains status 200 and `{msg, enrollment_id}`. Rejected-card request returns 400. Missing or non-string password now returns 400 instead of receiving a predictable default; this security-related input behavior change is explicit. |
| `GET /api/admin/financial-report` | Path and success response shape remain an array; endpoint test returned 200. |
| `DELETE /api/users/:id` | Path and success status remain 200; endpoint test returned 200. |

## Validation

| Check | Command | Result |
|---|---|---|
| Locked dependencies | `npm ci --no-audit --no-fund` | Pass, exit code 0; npm reported pre-existing deprecated transitive packages. |
| Syntax | `node --check` for each of the six runtime JavaScript modules | Pass, exit code 0. |
| Configuration and password helper | Node assertions verified environment-to-config mapping and the salted scrypt output format/uniqueness without printing credential values | Pass, exit code 0. |
| Runtime and endpoint checks | Node HTTP smoke assertions against an ephemeral local listener for checkout success, missing password, rejected payment, financial report, and user deletion | Pass, exit code 0. |
| Secret-safe report check | Re-read findings and test evidence; no credential values included | Pass. |

## Approval

Human approval: project owner, explicitly requested skill reapplication and fixes in this session.

Approved at: 2026-11-10T15:23:38Z
Scope approved: update the refactor skill/playbook, reapply the approved recommendations to `ecommerce-api-legacy`, and correct its report based on verified code and tests.

## Skill change review

Review verdict: Pass by self-review against the loaded HVE Builder workflow. Phase 3 now maps each approved recommendation to an implementation and verification, disallows success-shaped `Resolved` claims, and requires a post-change secret/health/report check. The playbook examples use redacted markers and have working links in all skill copies. The detailed HVE Builder catalog/rubric reference files could not be opened because file access outside the workspace was denied.

## Remaining limitations

The financial-report query pattern, delete integrity, checkout/repository boundary, and mutable cache/revenue state are still open. Password hashing was verified at the helper/output-format level and checkout request-level; there is no login endpoint or password-verification flow in this project. The claimed card/gateway logging finding was not reproduced in the source reviewed here.

The detailed HVE Builder catalog/rubric references remain unverified; rerun that specific review when the installed-plugin reference directory is accessible.
