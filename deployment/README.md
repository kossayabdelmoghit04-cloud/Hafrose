# HAFROSE production deployment

The deployment directory at repository root is the only production deployment source of truth.

## Architecture

- docker-compose.yml defines MySQL, Laravel FPM, queue worker, scheduler, React/Nginx, and the public Nginx edge.
- backend/Dockerfile builds PHP 8.4.3, Composer dependencies, MySQL clients, and runs as www-data.
- frontend/Dockerfile builds and serves the SPA.
- deployment/nginx/production.conf is the public proxy/TLS configuration.
- deployment/nginx/security-headers.conf is the canonical public headers policy.
- deployment/scripts/deploy.sh activates CI-built images tagged with a 40-character commit SHA.
- deployment/scripts/rollback.sh reactivates the previously recorded image tag.

backend/deployment is legacy reference material only. Its executable scripts fail immediately and must not be used. Root scripts/*.ps1 are local developer backup/health helpers, not production deployment entry points.

Deprecated, non-authoritative material:

- deployment/nginx/hafrose.conf and deployment/php/php-fpm.conf describe the former host-installed runtime.
- deployment/ssl/README.md and deployment/validation/ are historical checklists; C1b must replace them with evidence from the provisioned host.
- docs/server-deployment.md, backend/docs/server-deployment.md, and all backend/deployment content are retained for audit history only.
- .github/workflows/ci-cd.yml contains a permanently disabled legacy job for audit history; it must be deleted in a dedicated reviewed cleanup and must never be enabled.

## Required order

1. C1b provisions the host, Docker Engine, DNS, certificates, registry access, .env.production, and /var/lib/hafrose.
2. CI builds/tests backend and frontend images tagged by SHA, then publishes the exact tested artifacts.
3. Run deployment/scripts/deploy.sh with the 40-character SHA.
4. The script pulls images, runs preflight, starts MySQL, creates a backup, checks migration status, runs migrate --force, and activates without build.

## Official commands

- PRODUCTION_ENV_FILE=.env.production docker compose --env-file .env.production config
- deployment/scripts/deploy.sh SHA
- deployment/scripts/rollback.sh
- docker compose --env-file .env.production ps
- docker compose --env-file .env.production logs --tail=200

Never build on production. Never run migrate:fresh, db:wipe, or development seeders there. Writable exceptions are the MySQL volume, Laravel storage volume, and declared tmpfs paths; application code remains read-only.

For repository-only validation, use:

PRODUCTION_ENV_FILE=.env.production.example docker compose --env-file .env.production.example config --quiet

The GitHub production Environment is referenced but cannot be claimed as configured until C1b. It may require manual approval and must restrict deployments to the protected production branch. Required repository configuration is:

- secrets: PROD_SERVER_IP, PROD_SERVER_USER, PROD_SSH_PRIVATE_KEY;
- variables: PROD_DEPLOY_PATH and PRODUCTION_DEPLOY_ENABLED;
- registry credentials/image repository variables once a registry is selected.

PRODUCTION_DEPLOY_ENABLED must remain false or unset until the environment, registry artifacts, host, DNS, TLS, backups, and monitoring have been verified.

Laravel storage and bootstrap/cache are the only PHP writable paths. Nginx cache/run directories and /tmp are tmpfs. Read-only mode is intentionally not applied to MySQL data or the Laravel storage volume.

## External prerequisites not closed by C1a

Public VPS, DNS, trusted TLS certificates, production MySQL sizing/operations, real SMTP credentials, a real offsite disk, registry configuration, and external monitoring remain C1b work.
