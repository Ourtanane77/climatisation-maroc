# syntax=docker/dockerfile:1

# ---- base: PHP runtime with the extensions Laravel and Filament need ----
FROM php:8.4-fpm-alpine AS base

# mariadb-connector-c: MySQL 8 authentication plugin for mysqldump (php artisan app:backup).
RUN apk add --no-cache icu-libs libzip libpng libjpeg-turbo libwebp freetype mysql-client mariadb-connector-c \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev libpng-dev \
        libjpeg-turbo-dev libwebp-dev freetype-dev linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql intl zip gd bcmath exif pcntl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/backend

# ---- dev: source is bind-mounted, opcache revalidates ----
FROM base AS dev
ARG UID=1000
ARG GID=1000
RUN addgroup -g ${GID} app 2>/dev/null || true \
    && adduser -D -u ${UID} -G $(getent group ${GID} | cut -d: -f1) app 2>/dev/null || true
COPY docker/php/opcache-dev.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY docker/php/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint
ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

# ---- vendor: production dependencies only ----
FROM base AS vendor
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# ---- prod: application baked into the image ----
FROM base AS prod
COPY docker/php/opcache-prod.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY --from=vendor /var/www/backend/vendor ./vendor
COPY backend/ ./
# Seed and price authority (config/catalog.php reads ../data/catalog.json).
COPY data/catalog.json data/excel-additions.json /var/www/data/
# storage/ subfolders are excluded from the build context (.dockerignore): recreate them.
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
        storage/logs storage/app/public storage/app/private bootstrap/cache \
    && composer dump-autoload --optimize --no-dev \
    && php artisan filament:assets \
    && chown -R www-data:www-data storage bootstrap/cache
COPY docker/php/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint
USER www-data
ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]
