# Audit rubric

Use exact file and line references. Severity is based on exploitable or contract-breaking impact:

* **CRITICAL**: exposed credentials, authentication bypass, data loss, or an always-on production failure.
* **HIGH**: unsafe credential storage, unbounded destructive behavior, or a failure likely to corrupt data.
* **MEDIUM**: maintainability or reliability issue that can cause incorrect behavior under normal operation.
* **LOW**: local duplication, dead code, naming, or observability issue.

Every finding must include an observable consequence and a remediation that fits the current language/framework.

