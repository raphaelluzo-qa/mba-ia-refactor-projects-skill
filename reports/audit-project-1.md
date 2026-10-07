# Audit: code-smells-project

## Detection

Python 3 / Flask / SQLite e-commerce monolith. Initial architecture was one Flask entry point, a controller module mixing transport and domain rules, and a model module containing persistence. Initial count: 6 application files (`*.py`, `requirements.txt`, and project documentation excluded from the runtime count). Endpoint inventory: `/produtos`, `/produtos/busca`, `/produtos/<id>`, `/usuarios`, `/usuarios/<id>`, `/login`, `/pedidos`, `/pedidos/<usuario_id>`, `/admin/pedidos`, `/pedidos/<pedido_id>/status`, `/relatorio-vendas`, and `/health`.

## Findings

| Severity | Location | Anti-pattern | Impact | Remediation | Status |
|---|---|---|---|---|---|
| CRITICAL | `app.py:7` | Hard-coded Flask secret | Production sessions can be forged if the source leaks. | Read `SECRET_KEY` from environment and keep a development fallback. | Resolved |
| CRITICAL | `controllers.py:202-204` | Health endpoint exposes secret and database path | Operational and credential disclosure. | Return health state and counts only. | Resolved |
| HIGH | `models.py:50-85` | SQL and transaction orchestration mixed with domain operations | Partial orders can leave stock and payment state inconsistent. | Keep repository calls behind service orchestration. | Resolved |
| HIGH | `controllers.py:24-57` | Product validation duplicated in HTTP handler | Invalid values can bypass alternate callers. | Centralize validation in `services.py`. | Resolved |
| MEDIUM | `controllers.py:1-12` | Broad exception handling returns raw exception strings | Leaks internals and makes failures non-deterministic. | Use stable client messages and server logging. | Partially resolved |
| MEDIUM | `models.py:1-20` | Persistence module is also domain API | Prevents isolated tests and future storage changes. | Add `repositories.py` compatibility boundary. | Resolved |
| LOW | `controllers.py:191-193` | Notification side effects are inline | Checkout behavior is difficult to test. | Move notification adapter behind a service boundary. | Documented |
| LOW | `app.py:8` | Debug enabled in the entry point | Debugger can expose internals in deployment. | Set debug from environment with production-safe default. | Resolved |

## Endpoint contract

All original paths and verbs remain registered by `app.py`; response envelope keys (`dados`, `sucesso`, `erro`) and status codes were preserved for product, user, order, report, and health flows.

## Validation

| Check | Command | Result |
|---|---|---|
| Syntax | `python -m compileall code-smells-project` | Pass |
| Route import | `python -c "import sys; sys.path.insert(0,'code-smells-project'); import app"` | Pass |
| Health and route smoke | Flask test client against `/health`, `/produtos`, `/produtos/busca` | Pass |

## Approval

Human approval: challenge execution approval recorded by task request.

