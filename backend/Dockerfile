# ── Stage 1: Composer dependencies ───────────────────────────────────────────
FROM composer:2.7 AS composer-deps

WORKDIR /app

COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --optimize-autoloader \
    --prefer-dist

COPY . .

RUN composer dump-autoload --optimize --no-dev

# ── Stage 2: PHP-FPM Production ───────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS production

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        zip \
        gd \
        opcache

# OPcache configuration for production performance
RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
    echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# PHP-FPM production settings
RUN { \
    echo 'upload_max_filesize=20M'; \
    echo 'post_max_size=20M'; \
    echo 'max_execution_time=60'; \
    echo 'memory_limit=512M'; \
    echo 'expose_php=Off'; \
} > /usr/local/etc/php/conf.d/production.ini

WORKDIR /var/www/html

# Copy application from composer stage
COPY --from=composer-deps /app /var/www/html

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Remove sensitive files from production image
RUN rm -f .env.example .env.ci

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD php artisan --version || exit 1

CMD ["php-fpm"]
