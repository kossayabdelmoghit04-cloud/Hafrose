#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
STATE_DIR="${RELEASE_STATE_DIR:-/var/lib/hafrose}"
TAG_FILE="$STATE_DIR/previous-image-tag"

test -f "$ENV_FILE" || { echo "Missing $ENV_FILE" >&2; exit 1; }
test -f "$TAG_FILE" || { echo "No previous immutable image tag recorded." >&2; exit 1; }

IMAGE_TAG="$(cat "$TAG_FILE")"
export IMAGE_TAG
cd "$ROOT_DIR"

echo "Rolling back application images to $IMAGE_TAG."
echo "Database migrations are not reversed automatically."
docker compose --env-file "$ENV_FILE" pull backend frontend
docker compose --env-file "$ENV_FILE" up -d --no-build
docker compose --env-file "$ENV_FILE" exec -T backend php artisan up
docker compose --env-file "$ENV_FILE" ps
