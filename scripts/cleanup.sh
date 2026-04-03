#!/usr/bin/env bash
set -euo pipefail

confirm() {
  echo "This will DROP the database referenced by DATABASE_URL in .env."
  read -r -p "Are you sure you want to continue? (yes/no): " ans
  case "$ans" in
    y|Y|yes|YES|Yes)
      return 0
      ;;
    *)
      echo "Aborted. No changes made."
      exit 0
      ;;
  esac
}

if [ -t 1 ]; then
  confirm
else
  echo "Non-interactive shell detected — aborting. Pass through interactive terminal to confirm." >&2
  exit 1
fi

# Load env variables from .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  . .env
  set +a
fi

echo "Running: pnpm run drop-db"
pnpm run drop-db
