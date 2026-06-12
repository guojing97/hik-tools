FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  unzip \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  libonig-dev \
  libxml2-dev \
  libzip-dev \
  zip \
  supervisor \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install \
  pdo \
  pdo_mysql \
  mbstring \
  exif \
  pcntl \
  bcmath \
  gd \
  zip \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application source
COPY . /var/www

# Set permissions
RUN chown -R www-data:www-data /var/www \
  && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Install Node.js 24
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g npm \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /etc/apt/keyrings/yarn.gpg >/dev/null \
  && echo "deb [signed-by=/etc/apt/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
  && curl -sS https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/keyrings/pgdg.gpg >/dev/null \
  && echo "deb [signed-by=/etc/apt/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y yarn

# Verify versions (optional, safe)
RUN node -v && npm -v

# Install Node.js and npm
RUN yarn install

RUN yarn build

# Install dependencies & build
RUN composer install --no-dev --optimize-autoloader \
  && composer run build || true

# Laravel optimization
RUN php artisan key:generate --force \
  && php artisan optimize:clear \
  && php artisan optimize


USER www-data

EXPOSE 9000
CMD ["php-fpm"]
