# [FOSWLY] VOT Backend

Сервер для расширения списка поддерживаемых сайтов для voice-over-translation.

## Установка:

1. Разверните сервер [media-converter-backend](https://github.com/FOSWLY/media-converter-backend). Необходимо для конвертации файлов
2. Разверните сервер [translate-backend](https://github.com/FOSWLY/translate-backend). Необходимо для перевода текста без ограничений
3. Установите PostgreSQL 16+
4. Установите Redis 6.2.0+
5. Создайте S3 хранилище у любого провайдера или разверните локально с помощью Minio/CEPH
6. Установите [Bun](https://bun.sh/)
7. Клонируйте репозиторий с помощью команды:

```bash
git clone https://github.com/FOSWLY/vot-backend
```

1. Установите зависимости с помощью команды:

```bash
bun install
```

8. Переименуйте .example.env в .env и заполните его
9. Выполните миграцию базы данных:

```bash
bun migrate
```

10. Запустите сервер

```bash
bun start
```

### Установка с использованием PM2:

1. Выполните стандартные шаги установки 1-9
2. Установите зависимости:

```bash
bun install -g pm2 && pm2 install pm2-logrotate
```

3. Запустите сервер

```bash
pm2 start ecosystem.config.json
```

### Установка с использованием Docker Compose

1. Установите [Docker](https://www.docker.com/)
2. Разверните сервер [media-converter-backend](https://github.com/FOSWLY/media-converter-backend). Необходимо для конвертации файлов
3. Разверните сервер [translate-backend](https://github.com/FOSWLY/translate-backend). Необходимо для перевода текста без ограничений
4. Создайте S3 хранилище у любого провайдера или разверните локально с помощью Minio/CEPH
5. Клонируйте репозиторий с помощью команды:

```bash
git clone https://github.com/FOSWLY/vot-backend
```

6. Заполните переменные (environment) в docker-compose.yml своими данными:

```
db:
    ...
    environment:
      POSTGRES_DB: vot-backend # <-- имя бд по умолчанию (не трогайте, если вы не уверены в том, что делаете)
      POSTGRES_USER: postgres # <-- имя пользователя по умолчанию
      POSTGRES_PASSWORD: mysecretpassword # <-- пароль пользователя (поменяйте его)

vot-backend:
    ...
    environment:
      SERVICE_TOKEN: 90jrtire8i9u4353asdasdasd # <-- токен с помощью которого можно будет взаимодействовать с админ-эндпоинтами (поменяйте его)
      MEDIA_CONVERTER_HOSTNAME: http://localhost:3001 # <-- путь до вашего экземпляра media-converter (вы же уже засельфхостили его?)
      MEDIA_CONVERTER_TOKEN: x # <-- токен используемый для доступа к media-converter
      TRANSLATE_TEXT_HOSTNAME: https://translate.toil.cc # <-- путь до экземпляра перевода текста (лучше засельфхостите свой экземпляр, а не используйте публичный. Спасибо за понимание)
      S3_REGION: ru-central1 # <-- регион s3
      S3_ENDPOINT: https://storage.yandexcloud.net # <-- ссылка для доступа к s3
      S3_BUCKET: example # <-- имя бакета
      S3_ACCESS_KEY_ID: # <-- ваш Access Key
      S3_SECRET_ACCESS_KEY: # <-- ваш Secret Access Key
      REDIS_HOST: redis # <-- хост на котором работает Redis (не трогайте, если вы не уверены в том, что делаете)
      POSTGRES_NAME: vot-backend # <-- имя бд
      POSTGRES_HOST: db # <-- хост на котором работает Postgres (не трогайте, если вы не уверены в том, что делаете)
      POSTGRES_USER: postgres # <-- имя пользователя бд
      POSTGRES_PASSWORD: mysecretpassword # <-- пароль от бд (поменяйте его на тот, что используется для db выше)
```

Без заполнения следующих переменных реальными данными сервер нормально работать не будет:

```
MEDIA_CONVERTER_HOSTNAME
MEDIA_CONVERTER_TOKEN
S3_REGION
S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
```

7. Соберите образ с помощью команды:

```bash
docker compose build
```

7.1. Если у вас не получается собрать из-за ошибки, связанной с .env файлом, добавьте аргумент `--env-file nul` (для Windows) или `--env-file /dev/null` (для Linux)

```bash
docker compose --env-file /dev/null build
```

8. Запустите образ с помощью команды:

```bash
docker compose up -d
```

При первом холодном запуске могут быть ошибки, связанные с долгой инициализацией контейнера базы данных, но спустя пару автоматических рестартов все должно запуститься.

## Примечание:

1. Если у вас заблокирован какой-либо из сервисов, то гарантировать работоспособность я не могу

## S3

Поддерживаются только S3 хранилища, которые, хотя бы частично, поддерживают Presigned URL и имеют возможность отключения CORS.

Если вы не уверены, что в вашем S3 отключены CORS вам следует запустить скрипт для их отключения:

```bash
bun run s3:disable-cors
```

## Архитектурная схема

<img width="4213" alt="vot backend" src="https://github.com/FOSWLY/vot-backend/assets/62353659/a762511c-be29-4521-8f63-2dfb2cc8cfe7">
