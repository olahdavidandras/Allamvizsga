## Laravel && React

composer install

copy .env.example .env

php artisan key:generate

php artisan migrate --seed

composer require Laravel/ui

php artisan ui react

npm install

npx vite --version

npm --legacy-peer-deps

npm audit fix --force

npm audit

npm audit fix --force

npm uninstall laravel-vite-plugin

npm install laravel-vite-plugin@latest --save-dev

npm cache clean --force

## .env

APP_NAME=Laravel

APP_ENV=local

APP_KEY=

APP_DEBUG=true

APP_TIMEZONE=Europe/Budapest

APP_URL=http://localhost:8000

SANCTUM_STATEFUL_DOMAINS=localhost:5173

SESSION_DOMAIN=localhost


REPLICATE_API_KEY=


APP_LOCALE=en

APP_FALLBACK_LOCALE=en

APP_FAKER_LOCALE=en_US


APP_MAINTENANCE_DRIVER=file



PHP_CLI_SERVER_WORKERS=4


BCRYPT_ROUNDS=12


LOG_CHANNEL=stack

LOG_STACK=single

LOG_DEPRECATIONS_CHANNEL=null

LOG_LEVEL=debug


DB_CONNECTION=mysql

DB_HOST=127.0.0.1

DB_PORT=3306

DB_DATABASE=allamvizsga

DB_USERNAME=root

DB_PASSWORD=


SESSION_DRIVER=cookie

SESSION_LIFETIME=120

SESSION_ENCRYPT=false

SESSION_PATH=/



BROADCAST_CONNECTION=log

FILESYSTEM_DISK=local

QUEUE_CONNECTION=database


CACHE_STORE=database

CACHE_PREFIX=


MEMCACHED_HOST=127.0.0.1


REDIS_CLIENT=phpredis

REDIS_HOST=127.0.0.1

REDIS_PASSWORD=

REDIS_PORT=6379


MAIL_MAILER=log

MAIL_SCHEME=null

MAIL_HOST=127.0.0.1

MAIL_PORT=2525

MAIL_USERNAME=null

MAIL_PASSWORD=null

MAIL_FROM_ADDRESS="hello@example.com"

MAIL_FROM_NAME="${APP_NAME}"


AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

AWS_DEFAULT_REGION=us-east-1

AWS_BUCKET=

AWS_USE_PATH_STYLE_ENDPOINT=false


VITE_APP_NAME="${APP_NAME}"




