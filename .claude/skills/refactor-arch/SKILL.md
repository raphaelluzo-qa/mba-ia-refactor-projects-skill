---
name: refactor-arch
description: Detect, audit, obtain approval, and safely refactor legacy web APIs into stack-appropriate MVC.
---

# Refactor Arch

Run these phases **in order**. Do not skip a phase or modify application files before the audit is reviewed and explicitly approved by a human.

## Phase 1 - Detect

1. Inventory the repository without changing it.
2. Identify the language, framework, runtime version, domain, entry point, persistence technology, route surface, and current architecture.
3. Count application files by extension and record the command used.
4. Record the endpoint contract (method, path, status codes, and response shape) before refactoring.
5. Adapt the target architecture to the stack: Flask blueprints/controllers/services/models for Python; Express routers/controllers/services/repositories/models for Node. Do not force a directory layout that does not fit the project.

Write a short detection summary to the audit report. A missing dependency or broken boot is a finding, not a reason to silently guess.

## Phase 2 - Audit and approval gate

Inspect every application file and report exact `path:line` findings. Check at least these technology-agnostic anti-patterns:

- monolithic entry point / mixed responsibilities
- duplicated business rules
- persistence access from HTTP handlers
- hard-coded secrets or environment configuration
- insecure password or credential handling
- broad exception handling or silent failures
- missing input validation / unsafe type conversion
- N+1 queries or unbounded data access
- dead state, unused imports, or misleading names
- deprecated APIs and runtime incompatibilities

Classify every finding as `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`, sort by severity, and include impact plus a concrete remediation. Include a before/after count and an endpoint-preservation checklist.

**Mandatory gate:** stop after writing the audit and ask a human to approve modifications. Never infer approval from a plan, a prior conversation, or a green test.

## Phase 3 - Refactor and validate

After approval, refactor in small reversible changes:

1. Keep routes/controllers responsible for transport concerns only.
2. Move domain rules to services and persistence to repositories/models.
3. Move configuration and secrets to environment-backed settings with safe defaults. Use the patterns in [the transformation playbook](references/transformation-playbook.md); never replace a committed secret with another fixed value or a success-shaped placeholder.
4. Preserve all existing endpoint paths, verbs, status codes, and response keys unless an approved migration explicitly says otherwise.
5. Use framework-supported APIs and remove deprecated calls.
6. Map every approved Phase 2 finding and its concrete remediation to a code change and a verification check. Apply each actionable recommendation; if it cannot be applied, leave it `Open` or `Deferred` with a reason and do not describe it as resolved.
7. Validate syntax, boot, health checks, and every endpoint captured in Phase 1. Exercise both success and representative validation/not-found failures, and confirm the original endpoint contract.
8. Recheck source, logs, health responses, and reports for exposed credentials or sensitive configuration. Never copy secret values into reports, examples, logs, or test output.
9. Record commands, exit codes, response evidence, finding dispositions, and remaining known limitations in the final report. Mark a finding `Resolved` only when the code no longer has the cited behavior and the relevant check passes.

## Required report template

```markdown
# Audit: <project>
## Detection
## Findings
| Severity | Location | Anti-pattern | Impact | Remediation | Status |
## Endpoint contract
| Method | Path | Before/after evidence |
## Validation
| Check | Command | Result |
## Approval
Human approval: <name/date or pending>
```

The report's final finding status must match the verified implementation, not just the intended recommendation. Include the before/after evidence and any deferred work.
