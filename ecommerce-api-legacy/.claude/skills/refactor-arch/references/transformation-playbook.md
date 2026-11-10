# Transformation playbook

Use these patterns when applying approved audit recommendations. Examples intentionally use redacted markers and must never be replaced with real credential values.

## Secrets and runtime configuration

Before (unsafe):

```python
app.config["SECRET_KEY"] = "<hard-coded secret>"
app.config["DEBUG"] = True
```

After:

```python
import os
import secrets

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
app.config["DEBUG"] = os.environ.get("FLASK_DEBUG", "").strip().lower() in {"1", "true", "yes"}
```

The random fallback is for local development only and changes between process starts. Deployments that need stable sessions must inject a stable secret through their secret manager or environment; never commit a fallback secret.

Before (unsafe):

```javascript
const config = { paymentGatewayKey: "<hard-coded credential>" };
```

After:

```javascript
const config = Object.freeze({
  paymentGatewayKey: process.env.PAYMENT_GATEWAY_KEY,
});
```

Read each setting from the deployment environment or secret manager. Validate required configuration at the point it is needed and fail clearly when absent; do not substitute a fixed development or production credential.

## Health responses

Before (unsafe):

```python
return jsonify({
    "status": "ok",
    "secret_key": app.config["SECRET_KEY"],
    "debug": app.debug,
    "db_path": settings.DATABASE_PATH,
})
```

After:

```python
return jsonify({
    "status": "ok",
    "database": "connected",
    "counts": {"records": record_count},
})
```

Expose only operational state needed by the health-check caller. Keep credentials, filesystem paths, debug configuration, connection strings, and exception details out of health responses. Log diagnostic exceptions server-side without returning their text to callers.

## Finding-to-change traceability

For every approved finding, record its recommendation, changed location, verification command or test, result, and final status. A recommendation is not evidence that the defect was fixed: use `Resolved` only after the cited behavior is absent and the relevant verification passes. If scope or evidence prevents a fix, use `Open` or `Deferred` and state why. Do not copy secret values into reports, examples, logs, or test output.
