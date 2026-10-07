# Refactor Arch challenge

This repository contains three deliberately small legacy APIs and a reusable Claude Code skill at `.claude/skills/refactor-arch/`. The same skill is copied into each fixture under `<project>/.claude/skills/refactor-arch/`.

## Skill design

The skill is deliberately sequential:

1. **Detect** records language/framework/domain, current architecture, runtime entry point, file count, and endpoint contracts.
2. **Audit** requires exact file/line findings, at least eight technology-agnostic anti-pattern checks, deprecated API detection, severity sorting, and a human approval gate before application edits.
3. **Refactor** uses stack-appropriate MVC: Flask blueprints/services/models for Python and Express routers/services/repositories for Node. It preserves endpoint contracts and validates boot plus original routes.

The partially organized task manager is adapted rather than flattened: its existing `models/`, `routes/`, and `services/` boundaries remain, with a focused `task_service.py` added for shared serialization and validation.

## Manual analysis and results

| Project | Before | After | Critical/high | Medium | Low | Report |
|---|---:|---:|---:|---:|---:|---|
| `code-smells-project` | 6 runtime files | 8 runtime files | 4 | 2 | 2 | [audit-project-1.md](reports/audit-project-1.md) |
| `ecommerce-api-legacy` | 3 JavaScript files | 6 JavaScript files | 4 | 2 | 2 | [audit-project-2.md](reports/audit-project-2.md) |
| `task-manager-api` | 17 Python files | 18 Python files | 4 | 2 | 2 | [audit-project-3.md](reports/audit-project-3.md) |

### Project 1: code-smells-project

The critical issues were a hard-coded Flask secret and a health response that disclosed the secret. High-severity issues were mixed checkout/persistence orchestration and duplicated product validation. Medium issues were broad exception handling and persistence/domain coupling. Low issues were inline notification side effects and debug mode. Product validation now lives in `services.py`, persistence is exposed through `repositories.py`, and health output no longer discloses internals.

### Project 2: ecommerce-api-legacy

The critical issues were committed gateway-looking credentials and logging payment data. High-severity issues were the god-object checkout flow and nested report orchestration. Medium issues were destructive delete behavior and homemade password hashing. Low issues were listening during import and global mutable state. Checkout now delegates to `CheckoutService` and `CourseRepository`; `app.js` is import-safe and configuration is environment-backed.

### Project 3: task-manager-api

The critical issues were MD5 passwords and password serialization. High-severity issues were hard-coded Flask configuration and debug boot, plus duplicated task serialization. Medium issues were deprecated `Model.query.get` and report query loops. Low issues were hard-coded SMTP credentials and broad date parsing. Passwords are adaptive-hashed and never serialized; task serialization/validation is shared in `services/task_service.py`.

## Validation checklist

- [x] Skill copied into all three projects.
- [x] Detection and endpoint contracts recorded.
- [x] Each audit contains 8 findings, severity sorted, with exact locations.
- [x] Deprecated API detection included.
- [x] Human approval gate documented before refactor.
- [x] Python syntax/import checks run for both Flask projects.
- [x] Node syntax and boot checks run for the Express project.
- [x] Health, CRUD/validation, checkout success/failure, and login success/failure checks recorded.
- [x] Original endpoint paths and response contracts preserved.
- [x] Runtime evidence and command results are recorded in each report.

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
