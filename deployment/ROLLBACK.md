# Immutable image rollback

deployment/scripts/rollback.sh reads the previously successful SHA from RELEASE_STATE_DIR (default /var/lib/hafrose) and reactivates those backend/frontend images with --no-build.

## Preconditions

- The previous SHA images still exist in the registry.
- The production environment file and TLS material remain present.
- Any migration deployed with the failed release is backward-compatible with the previous application.
- A consistent pre-migration backup exists and has passed integrity verification.

## Command

Run deployment/scripts/rollback.sh, then inspect docker compose ps, /api/health, the frontend, worker, and scheduler.

The rollback script never runs git reset and never reverses database migrations automatically. If a schema rollback is unavoidable, stop and execute the separately reviewed database recovery plan from RESTORE.md.
