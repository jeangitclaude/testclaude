# Todolist — Symfony 7 + React 18 + Docker (FrankenPHP)

Stack conforme à `SPEC_TODOLIST.md` : API Symfony 7, front React/Vite/Tailwind, image Docker unique de prod (FrankenPHP + Caddy), MySQL externe.

## 1. Préparer la base MySQL

Dans DBeaver, exécute :

```sql
CREATE DATABASE todolist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app'@'%' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON todolist.* TO 'app'@'%';
FLUSH PRIVILEGES;
```

Puis crée [api/.env.local](api/.env.local) :

```env
DATABASE_URL="mysql://app:CHANGE_ME@host.docker.internal:3306/todolist?serverVersion=8.4.0&charset=utf8mb4"
```

(Optionnel) crée un `.env` à la racine pour Compose avec la même `DATABASE_URL`.

## 2. Dev

```bash
docker compose up -d --build
```

- API : http://localhost:8080/api/tasks
- Front : http://localhost:5173

Au premier démarrage, le container `api` lance `composer install` automatiquement (cf. CMD du stage `dev-api`).

### Migrations Doctrine (à faire après le premier `up`)

```bash
docker compose exec api php bin/console make:migration
docker compose exec api php bin/console doctrine:migrations:migrate -n
```

## 3. Tester l'API (Postman / curl)

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Première tâche","priority":2}'

curl http://localhost:8080/api/tasks
curl -X PATCH http://localhost:8080/api/tasks/<uuid>/toggle
curl -X DELETE http://localhost:8080/api/tasks/<uuid>
```

## 4. Build de l'image prod (image unique)

```bash
docker build --target prod -t todolist:latest .
```

Test local :

```bash
docker run --rm -p 8081:8080 \
  -e APP_SECRET=$(openssl rand -hex 16) \
  -e DATABASE_URL="mysql://app:CHANGE_ME@host.docker.internal:3306/todolist?serverVersion=8.4.0&charset=utf8mb4" \
  --add-host=host.docker.internal:host-gateway \
  todolist:latest
```

Ouvre http://localhost:8081 — la SPA React et l'API sont sur le même domaine, `/api/*` route vers Symfony, le reste vers le bundle React.

## 5. Déploiement

Une seule image à push :

```bash
docker tag todolist:latest registry.example.com/todolist:latest
docker push registry.example.com/todolist:latest
```

Sur l'hébergeur (Coolify / Railway / Fly.io) : déploie l'image, expose le port 8080, fournit `DATABASE_URL` + `APP_SECRET` en variables d'environnement, branche un MySQL managé.

## Structure

- [Dockerfile](Dockerfile) — multi-stage : `dev-api`, `dev-front`, `front-build`, `prod`
- [Caddyfile](Caddyfile) — routing `/api/*` → Symfony, reste → SPA
- [docker-compose.yml](docker-compose.yml) — dev (API + Vite)
- [api/](api/) — Symfony 7
- [front/](front/) — React 18 + Vite + Tailwind
