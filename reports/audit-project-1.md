# Audit: code-smells-project

## Detection

Python 3.14 / Flask 3.1 / SQLite e-commerce API. The application has six Python runtime modules (`app.py`, `controllers.py`, `database.py`, `models.py`, `repositories.py`, and `services.py`) plus `requirements.txt`; the runtime module count for this pass was 6 before and 6 after. Inventory command: `Get-ChildItem 'code-smells-project' -File -Filter '*.py' | Measure-Object`.

The entry point is `app.py`; controllers own HTTP handling, models contain both SQL and domain operations, `repositories.py` only re-exports model functions, and `services.py` has product validation that controllers do not call. Persistence is SQLite in `loja.db`.

No deprecated Flask/Python API was identified in the six reviewed runtime modules.

The complete route inventory is `GET /`, `GET|POST /produtos`, `GET /produtos/busca`, `GET|PUT|DELETE /produtos/<int:id>`, `GET|POST /usuarios`, `GET /usuarios/<int:id>`, `POST /login`, `GET|POST /pedidos`, `GET /pedidos/usuario/<int:usuario_id>`, `PUT /pedidos/<int:pedido_id>/status`, `GET /relatorios/vendas`, `GET /health`, `POST /admin/reset-db`, and `POST /admin/query`.

The earlier report marked the secret and health findings resolved without corresponding code changes. This re-audit treats those as unresolved until verified, then records the corrections made in this pass. Endpoint paths and methods are unchanged.

## Findings

| Severity | Location | Anti-pattern | Impact | Remediation | Status |
|---|---|---|---|---|---|
| CRITICAL | `app.py:7` before; `app.py:9` after | Fixed application signing secret | A source disclosure could compromise signed sessions. | Read the production secret from `SECRET_KEY`; use only a random per-process local fallback. | Resolved: environment-backed configuration; generated fallback and debug-off defaults were asserted with environment values unset. |
| CRITICAL | `controllers.py:202-204` before; `controllers.py:264-284` after | Health response exposed secret and runtime configuration | Health requests could disclose credentials and deployment details. | Omit secret, debug, and database-path fields; return a generic error body and log details only server-side. | Resolved: `/health` returned 200 and contained no `secret_key`, `debug`, or `db_path`; response keys unrelated to those disclosures remain. |
| CRITICAL | `app.py:61-81` | Unauthenticated SQL execution route | The administrative endpoint accepts caller-provided SQL and can expose or alter stored data. | Remove the route or replace it with authenticated, allowlisted administrative operations. | Open: intentionally not changed in this narrowly scoped correction. |
| HIGH | `models.py:28-68,92,109,126,140-163,174,279-299` | SQL statements assembled from values | User-controlled values can alter database operations; several write paths also lack parameter binding. | Parameterize all statements and add focused repository tests. | Open. |
| HIGH | `database.py:63-77`; `models.py:72-118,122-131` | Seeded and user passwords are stored or returned as plaintext | A database disclosure exposes account credentials; user-list/detail responses include the password field. | Hash passwords, verify hashes during login, and omit password material from every API response. | Open: this requires a credential/data migration and response-contract change beyond the requested secret and health correction. |
| HIGH | `controllers.py:10,21,60,95,108,125,133,143,164,185,218,226,234,254,261`; `app.py:74-81` | Broad exception handling returns raw exception text | Internal database and runtime details can leak to clients. | Log exceptions server-side and return stable error responses. | Open: only the health handler was changed to avoid returning diagnostic details. |
| MEDIUM | `models.py:133-168` | Order validation, reads, writes, and stock updates are not transactionally guarded | A mid-operation failure can leave an incomplete order or inconsistent stock. | Move orchestration to a service and use a database transaction with rollback. | Open. |
| MEDIUM | `controllers.py:24-58`; `services.py:5-20` | Product validation is duplicated and the service validator is not used by routes | HTTP behavior and service validation can diverge. | Route create/update requests through one shared validator. | Open. |
| MEDIUM | `repositories.py:1-14`; `controllers.py:2` | Repository module is only a re-export; controllers still depend on models | Persistence and domain boundaries remain coupled. | Move SQL behind repository functions and have services/controllers depend on that boundary. | Open. |
| LOW | `controllers.py:202-206` | Notification side effects and operational output remain in controllers | Order behavior is harder to test and replace. | Move notifications behind a service/adapter boundary. | Open. |
| LOW | `app.py:10,90` | Debug mode was enabled unconditionally | Debug mode can expose internals in deployment. | Default debug off and require an explicit development setting. | Resolved: `FLASK_DEBUG` is opt-in and `app.run` uses the resolved setting. |

## Endpoint contract

| Method and path | Before/after evidence |
|---|---|
| `GET /` | Before/after route unchanged; test client returned 200. |
| `GET /produtos`, `POST /produtos` | Route and response envelopes preserved; list returned 200 and create returned 201. |
| `GET /produtos/busca` | Route and response envelope preserved; returned 200. |
| `GET /produtos/<int:id>`, `PUT /produtos/<int:id>`, `DELETE /produtos/<int:id>` | Success returned 200; missing product returned 404. |
| `GET /usuarios`, `GET /usuarios/<int:id>`, `POST /usuarios` | Routes and response envelopes preserved; returned 200/201. |
| `POST /login` | Successful login returned 200; invalid credentials returned 401. |
| `GET /pedidos`, `POST /pedidos`, `GET /pedidos/usuario/<int:usuario_id>`, `PUT /pedidos/<int:pedido_id>/status` | Routes preserved; success returned 200/201 and invalid status returned 400. |
| `GET /relatorios/vendas` | Route and response envelope preserved; returned 200. |
| `GET /health` | Method/path and 200 status preserved; response no longer includes secret, debug, or database path. |
| `POST /admin/reset-db`, `POST /admin/query` | Method/path preserved; isolated test database returned 200 for each. |

## Validation

| Check | Command | Result |
|---|---|---|
| Syntax | `python -m compileall -q .` (from `code-smells-project`) | Pass, exit code 0. |
| Runtime and endpoint checks | Flask test client with a temporary SQLite database; 26 assertions covering all listed routes, success and representative failure cases, debug defaults, and health response fields | Pass, exit code 0. |
| Scope cleanup | Temporary SQLite database closed and removed by the test script | Pass. |
| Secret-safe report check | Re-read findings and response evidence; no credential values included | Pass. |

## Approval

Human approval: project owner, explicitly requested skill reapplication and fixes in this session.

Approved at: 2026-11-10T15:23:38Z
Scope approved: update the refactor skill/playbook, reapply the approved recommendations to `code-smells-project`, and correct its report based on verified code and tests.

## Skill change review

Review verdict: Pass by self-review against the loaded HVE Builder workflow. Phase 3 now maps each approved recommendation to an implementation and verification, disallows success-shaped `Resolved` claims, and requires a post-change secret/health/report check. The playbook examples use redacted markers and have working links in all skill copies. The detailed HVE Builder catalog/rubric reference files could not be opened because file access outside the workspace was denied.

## Remaining limitations

The open SQL execution, SQL binding, password handling, broad exception, transaction, validation, repository-boundary, and notification findings are not claimed as resolved. The product's seeded account credentials and plaintext password handling remain a separate high-risk remediation; a safe migration would change login storage and user response contracts.

The detailed HVE Builder catalog/rubric references remain unverified; rerun that specific review when the installed-plugin reference directory is accessible.
