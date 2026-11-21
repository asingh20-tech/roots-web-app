#!/bin/sh
# Runs on every container start (every deploy): apply migrations, then serve.
set -e
mkdir -p "$MEDIA_ROOT"
python manage.py migrate --noinput
exec gunicorn roots.wsgi \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-3}" \
  --timeout 60 \
  --access-logfile -