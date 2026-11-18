# Roots: one image = React build + Django API, served by gunicorn.
# Build:  docker build -t roots .
# Run:    see docker-compose.yml (local) or the deployment guide (Railway/Render).

# ---- Stage 1: build the React frontend -------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Django backend ------------------------------------------------
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    MEDIA_ROOT=/data/private_media
WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY --from=frontend /app/frontend/dist frontend/dist

# collectstatic only needs settings to import; these values are build-time dummies.
RUN DJANGO_SECRET_KEY=build-only POSTGRES_DB=x POSTGRES_USER=x POSTGRES_PASSWORD=x \
    python backend/manage.py collectstatic --noinput

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/backend
EXPOSE 8000
CMD ["/entrypoint.sh"]
