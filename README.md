# Refactor Arch challenge

This repository contains three deliberately small legacy APIs and a reusable Claude Code skill at `.claude/skills/refactor-arch/`. The same skill is copied into each fixture under `<project>/.claude/skills/refactor-arch/`.

## Skill design

The skill is deliberately sequential:

1. **Detect** records language/framework/domain, current architecture, runtime entry point, file count, and endpoint contracts.
2. **Audit** requires exact file/line findings, at least eight technology-agnostic anti-pattern checks, deprecated API detection, severity sorting, and a human approval gate before application edits.
3. **Refactor** uses stack-appropriate MVC: Flask blueprints/services/models for Python and Express routers/services/repositories for Node. It preserves endpoint contracts and validates boot plus original routes.

Phase 3 follows the approved Phase 2 recommendations using the transformation examples in `.claude/skills/refactor-arch/references/transformation-playbook.md`. Audit reports must distinguish verified fixes from open or deferred findings; secret values must not appear in reports or test evidence.

The partially organized task manager is adapted rather than flattened: its existing `models/`, `routes/`, and `services/` boundaries remain, with a focused `task_service.py` added for shared serialization and validation.

## Manual analysis and results

| Project | Runtime modules reviewed | Findings still open | Report |
|---|---:|---:|---|
| `code-smells-project` | 6 Python modules | 8 | [audit-project-1.md](reports/audit-project-1.md) |
| `ecommerce-api-legacy` | 6 JavaScript modules | 4 | [audit-project-2.md](reports/audit-project-2.md) |
| `task-manager-api` | 17 Python modules | Prior audit | [audit-project-3.md](reports/audit-project-3.md) |

### Project 1: code-smells-project

The critical issues were a hard-coded Flask secret and a health response that disclosed sensitive configuration. High-severity issues were mixed checkout/persistence orchestration and duplicated product validation. Medium issues were broad exception handling and persistence/domain coupling. Low issues were inline notification side effects and debug mode. Product validation now lives in `services.py`, persistence is exposed through `repositories.py`, and health output no longer discloses sensitive configuration.

### Project 2: ecommerce-api-legacy

The critical issues were committed gateway credentials and logging payment data. High-severity issues were the god-object checkout flow and nested report orchestration. Medium issues were destructive delete behavior and homemade password hashing. Low issues were listening during import and global mutable state. Checkout now delegates to `CheckoutService` and `CourseRepository`; `app.js` is import-safe and runtime configuration is environment-backed.

### Project 3: task-manager-api

The critical issues were MD5 passwords and password serialization. High-severity issues were hard-coded Flask configuration and debug boot, plus duplicated task serialization. Medium issues were deprecated `Model.query.get` and report query loops. Low issues were hard-coded SMTP credentials and broad date parsing. Passwords are adaptive-hashed and never serialized; task serialization/validation is shared in `services/task_service.py`.

## Validation checklist

- [x] Skill copied into all three projects with the same transformation playbook.
- [x] Detection and endpoint contracts recorded.
- [x] Re-audited findings are severity-sorted, have exact locations, and distinguish verified fixes from open items.
- [x] Secret and health-response transformation examples contain no real credential values.
- [x] Human approval gate documented before refactor.
- [x] Python syntax and 26 test-client assertions pass for `code-smells-project`.
- [x] Node syntax, environment config, password hashing, and HTTP endpoint assertions pass for `ecommerce-api-legacy`.
- [x] Endpoint paths and methods are unchanged; the newly required checkout password is documented.
- [x] Remaining audit findings are explicitly left open rather than labeled resolved without evidence.
- [x] HVE Builder review verdict and local validation are recorded in the updated reports.

## Execution

```bash
# Python fixtures
python -m compileall code-smells-project
python -m compileall task-manager-api

# Node fixture
cd ecommerce-api-legacy
npm install
node --check src/app.js
node src/app.js
```

For an interactive run, invoke the skill from each project and stop after Phase 2 until a human confirms the audit. The reports in `reports/` are the executed challenge evidence; they intentionally retain known follow-up work where changing behavior would exceed the endpoint-preservation scope.
