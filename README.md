# Docker Run Guide (Iris Recognition Web)

This guide shows how to run the full stack (Postgres + FastAPI + React) with Docker.

## Prerequisites

- Docker Desktop installed and running
- Ports free: 3000 (frontend), 8000 (backend), 5432 (postgres)

## Quick start

From the repo root:

```bash
docker-compose up -d --build
```

If your Docker uses the new CLI, replace with:

```bash
docker compose up -d --build
```

## Run database migrations

Run once after the containers are up:

```bash
docker-compose exec backend alembic upgrade head
```

## Access the app

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## Stop containers

```bash
docker-compose down
```

To also remove the Postgres data volume:

```bash
docker-compose down -v
```

## Useful commands

- View logs:

```bash
docker-compose logs -f backend
```

- Restart only backend:

```bash
docker-compose restart backend
```

## Notes

- The backend connects to the Postgres service via:
  postgresql://iris_user:iris_password@postgres:5432/iris_recognition_db
- The frontend uses VITE_API_URL=http://localhost:8000
- Code is mounted into containers, so backend auto-reload and frontend dev server are active
