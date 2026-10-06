# syntax=docker/dockerfile:1
# Production nginx: carries Laravel's public/ (index.php stub and Filament assets).
# Uploaded files come from the shared storage volume.
# "app" is the php:prod image, passed by compose as an additional build context.
FROM nginx:1.27-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/backend/public /var/www/backend/public
