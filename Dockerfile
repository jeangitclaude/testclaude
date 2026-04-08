# syntax=docker/dockerfile:1.6

# ======================
# Stage 1 : Dev API (FrankenPHP + Composer + extensions)
# ======================
FROM dunglas/frankenphp:1-php8.3-alpine AS dev-api

RUN apk add --no-cache git icu-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
 && install-php-extensions pdo_mysql intl opcache zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

ENV SERVER_NAME=":8080"
EXPOSE 8080

# At first run, install deps if vendor missing then start FrankenPHP
CMD sh -c "if [ ! -d vendor ]; then composer install --no-interaction; fi && \
           php bin/console cache:clear || true && \
           frankenphp run --config /etc/caddy/Caddyfile"

# ======================
# Stage 2 : Dev Front (Vite dev server)
# ======================
FROM node:20-alpine AS dev-front
WORKDIR /app
COPY front/package*.json ./
RUN npm install
COPY front/ ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ======================
# Stage 3 : Build Front (static assets)
# ======================
FROM node:20-alpine AS front-build
WORKDIR /app
COPY front/package*.json ./
RUN npm ci || npm install
COPY front/ ./
RUN npm run build
# -> /app/dist

# ======================
# Stage 4 : Prod (single image)
# ======================
FROM dunglas/frankenphp:1-php8.3-alpine AS prod

RUN apk add --no-cache icu-dev oniguruma-dev libzip-dev \
 && install-php-extensions pdo_mysql intl opcache zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Symfony app
COPY api/ ./
# Create a minimal .env so Symfony's dotenv loader doesn't crash during build
# (real values are injected via env vars at runtime by the host)
RUN printf 'APP_ENV=prod\nAPP_DEBUG=0\nAPP_SECRET=build\nDATABASE_URL="mysql://build:build@localhost:3306/build?serverVersion=8.0&charset=utf8mb4"\n' > .env
RUN APP_ENV=prod APP_DEBUG=0 composer install --no-dev --optimize-autoloader --no-interaction \
 && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear --no-debug \
 && APP_ENV=prod APP_DEBUG=0 php bin/console cache:warmup --no-debug

# Built React assets
COPY --from=front-build /app/dist /app/public/app

# Caddy config
COPY Caddyfile /etc/caddy/Caddyfile

ENV APP_ENV=prod APP_DEBUG=0 SERVER_NAME=":8080"
EXPOSE 8080

CMD sh -c "php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration && \
           frankenphp run --config /etc/caddy/Caddyfile"
