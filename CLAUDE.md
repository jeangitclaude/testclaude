# Projet — Todolist (Symfony + React)

## Stack
- **API** : Symfony (PHP 8.3) servie par FrankenPHP, ORM Doctrine, MySQL
- **Front** : React + Vite, buildé en statique et servi par FrankenPHP sous `/app`
- **Image prod** : single-container multi-stage dans [Dockerfile](Dockerfile), stage `prod` (port 8080)
- **Dev** : [docker-compose.yml](docker-compose.yml) — services `api` (stage `dev-api`, port 8080) et `front` (stage `dev-front`, Vite port 5173)

## Commandes courantes

### Dev local
```bash
docker compose up           # lance api + front en mode dev (hot reload)
docker compose down
```

### Build & test prod local
```bash
docker build --target prod -t todolist-prod .
docker run --rm -p 8080:8080 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db?serverVersion=8.0&charset=utf8mb4" \
  -e APP_SECRET="$(openssl rand -hex 32)" \
  todolist-prod
# -> http://localhost:8080
```

### Migrations Doctrine
Exécutées automatiquement au démarrage du container prod (voir `CMD` du stage `prod` dans le Dockerfile).
Manuellement en dev : `docker compose exec api php bin/console doctrine:migrations:migrate`

## Déploiement

- **Hébergeur app** : Back4app Containers (déploiement depuis repo GitHub, build la dernière stage = `prod`)
- **Hébergeur BDD** : Clever Cloud, add-on MySQL plan DEV (gratuit)
- **Variables d'env requises en prod** : `APP_ENV=prod`, `APP_DEBUG=0`, `APP_SECRET`, `DATABASE_URL`, `SERVER_NAME=:8080`
- Plan de déploiement détaillé : `C:\Users\jackm\.claude\plans\lucky-shimmying-llama.md`

## Conventions
- Le `Dockerfile` est multi-stage — ne **jamais** toucher aux stages `dev-api` / `dev-front` / `front-build` sans raison, ils sont utilisés par docker-compose.
- Les modifs prod-only vont dans le stage `prod` uniquement.
