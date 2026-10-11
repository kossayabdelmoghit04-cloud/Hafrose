FROM composer:2.8.12 AS composer-bin

# composer.lock pins PHP 8.4.3. Install dependencies only after every required
# extension is available in the same runtime image used in production.
FROM php:8.4.3-fpm-alpine3.21 AS production

RUN apk add --no-cache \
        curl \
        icu-libs \
        libjpeg-turbo \
        libpng \
        libwebp \
        libzip \
        mariadb-client \
    && apk add --no-cache --virtual .build-deps \
        curl-dev \
        icu-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libwebp-dev \
        libxml2-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        bcmath curl dom gd intl mbstring opcache pdo_mysql simplexml xml xmlreader xmlwriter zip \
    && apk del .build-deps

COPY --from=composer-bin /usr/bin/composer /usr/local/bin/composer

RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
    echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini \
    && { \
    echo 'upload_max_filesize=20M'; \
    echo 'post_max_size=25M'; \
    echo 'max_execution_time=60'; \
    echo 'memory_limit=512M'; \
    echo 'expose_php=Off'; \
} > /usr/local/etc/php/conf.d/production.ini

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist --no-progress

COPY . .

RUN composer dump-autoload --no-dev --optimize --no-interaction \
    && composer check-platform-reqs --no-dev \
    && mkdir -p storage/app/public storage/app/backups storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && test -e public/storage || ln -s ../storage/app/public public/storage \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R u=rwX,g=rwX,o=rX storage bootstrap/cache \
    && rm -f .env .env.ci .env.example

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["php", "artisan", "hafrose:healthcheck", "--quiet"]

USER www-data

CMD ["php-fpm", "-F"]
