# Audit: task-manager-api

## Detection

Python 3 / Flask / Flask-SQLAlchemy task-management API. This project already had `models/`, `routes/`, `services/`, and `utils/`, so the refactor preserves that organization and adds a focused task service rather than forcing a new layout. Initial count: 17 Python files plus requirements and documentation. Endpoint inventory: health/root, task CRUD/search/stats, user CRUD/login/user tasks, reports, and category CRUD.

## Findings

| Severity | Location | Anti-pattern | Impact | Remediation | Status |
|---|---|---|---|---|---|
| CRITICAL | `models/user.py:23-31` | MD5 password hashing | Password compromise is trivial with offline cracking. | Use Werkzeug's adaptive password hashing. | Resolved |
| CRITICAL | `models/user.py:17-22` | Password included in user serialization | Any user endpoint leaks credential hashes. | Remove password from `to_dict`. | Resolved |
| HIGH | `app.py:13,31` | Hard-coded secret and debug boot | Secrets leak and debugger may execute arbitrary code. | Environment-backed secret and debug disabled by default. | Resolved |
| HIGH | `routes/task_routes.py:8-66` | Serialization and overdue rules duplicated in route | Contract drift between list and detail responses. | Add `services/task_service.py` serializer. | Resolved |
| MEDIUM | `routes/task_routes.py:1-245` | Deprecated `Model.query.get` and broad catches | Framework upgrades and unexpected errors are obscured. | Use `db.session.get` and narrow parse catches. | Resolved |
| MEDIUM | `routes/report_routes.py:15-74` | Per-user/per-task query loops | Report latency grows linearly with multiple database round trips. | Keep report contract, then consolidate queries behind a report service. | Documented |
| LOW | `services/notification_service.py:1-12` | SMTP credentials hard-coded | Deployment-specific configuration cannot be rotated safely. | Read password from `SMTP_PASSWORD`. | Resolved |
| LOW | `utils/helpers.py:44-50` | Nested broad date parsing catches | Invalid input is silently converted or hidden. | Catch `ValueError` and return explicit validation errors. | Documented |

## Endpoint contract

All original route registrations remain in place. The task service only centralizes serialization/validation, so task JSON keys, HTTP status codes, health response, user response shape (minus the unsafe password field), reports, and categories remain compatible.

## Validation

| Check | Command | Result |
|---|---|---|
| Syntax | `python -m compileall task-manager-api` | Pass |
| Boot/import | `python -c "import sys; sys.path.insert(0,'task-manager-api'); from app import app"` | Pass |
| Health/root | Flask test client `GET /health`, `GET /` | Pass |
| Task validation | Flask test client invalid title and valid create | Pass; 400 and 201 |
| Login | Seeded test client login success/failure | Pass; 200 and 401 |

## Approval

Human approval: challenge execution approval recorded by task request.

