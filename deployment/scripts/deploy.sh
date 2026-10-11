#!/usr/bin/env sh
set -eu

TARGET_TAG="${1:-}"
if ! printf '%s' "$TARGET_TAG" | grep -Eq '^[0-9a-f]{40}$'; then
  echo "Usage: $0 <40-character-commit-sha>" >&2
  exit 64
fi

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
STATE_DIR="${RELEASE_STATE_DIR:-/var/lib/hafrose}"

test -f "$ENV_FILE" || { echo "Missing $ENV_FILE" >&2; exit 1; }
mkdir -p "$STATE_DIR"

PREVIOUS_TAG=""
if test -f "$STATE_DIR/current-image-tag"; then
  PREVIOUS_TAG="$(cat "$STATE_DIR/current-image-tag")"
fi

cd "$ROOT_DIR"
export IMAGE_TAG="$TARGET_TAG"

docker compose --env-file "$ENV_FILE" pull backend frontend
docker compose --env-file "$ENV_FILE" run --rm backend php artisan hafrose:production-check
docker compose --env-file "$ENV_FILE" up -d db
docker compose --env-file "$ENV_FILE" run --rm backend php artisan hafrose:backup --detailed
docker compose --env-file "$ENV_FILE" exec -T backend php artisan down --retry=60 || true
docker compose --env-file "$ENV_FILE" run --rm backend php artisan migrate:status
docker compose --env-file "$ENV_FILE" run --rm backend php artisan migrate --force --no-interaction
docker compose --env-file "$ENV_FILE" up -d --no-build
docker compose --env-file "$ENV_FILE" exec -T backend php artisan config:cache
docker compose --env-file "$ENV_FILE" exec -T backend php artisan route:cache
docker compose --env-file "$ENV_FILE" exec -T backend php artisan view:cache
docker compose --env-file "$ENV_FILE" exec -T backend php artisan up

if test -n "$PREVIOUS_TAG"; then
  printf '%s\n' "$PREVIOUS_TAG" > "$STATE_DIR/previous-image-tag"
fi
printf '%s\n' "$TARGET_TAG" > "$STATE_DIR/current-image-tag"

docker compose --env-file "$ENV_FILE" ps
echo "Release $TARGET_TAG activated from immutable images."
