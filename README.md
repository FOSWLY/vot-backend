# [FOSWLY] VOT Backend

Сервер для расширения списка поддерживаемых сайтов для voice-over-translation.

## 🛠️ Быстрый старт

Рекомендуется выполнять установку с помощью Docker. В противном случае, вам прийдется слишком многое ставить и настраивать вручную.

**Независимо от метода установки** вам нужно вручную развернуть два сервера необходимых для корректной работы:

1. [media-converter-backend](https://github.com/FOSWLY/media-converter-backend) - необходим для конвертации видео файлов
2. [translate-backend](https://github.com/FOSWLY/translate-backend) - необходим для перевода текста без ограничений

> [!CAUTION]
> Перед открытием доступа извне не забудьте поменять все небезопасные стандартные значения переменных окружения (они помечены как "поменяйте его")

Если вы хотите, чтобы ваш инстанс был доступен извне, не забудьте после установки сделать проксирование локального порта сервера с помощью Nginx или его аналогов. Если вы используете локальный Minio вам нужно будет сделать проксирование и для него.

### 🐋 С Docker

1. Установите [Docker](https://www.docker.com/)
2. Клонируйте репозиторий с помощью команды:

```bash
git clone https://github.com/FOSWLY/vot-backend
```

3. (Опционально) Создайте S3 хранилище у любого провайдера. Вы можете пропустить этот пункт, если хотите использовать локальный Minio в Docker
4. Заполните переменные окружения (environment) в `docker-compose.yml` своими данными:

```
minio:
 ...
  environment:
    MINIO_ROOT_USER: root # <-- имя пользователя в minio
    MINIO_ROOT_PASSWORD: changeme # <-- пароль пользователя в minio (поменяйте его)
createbucket:
  ...
  entrypoint: >
  ...
   /usr/bin/mc alias set myminio http://minio:9000 root changeme; # <-- root - MINIO_ROOT_USER, changeme - MINIO_ROOT_PASSWORD из minio. Они должны быть одинаковыми с теми, что вы указали выше
   /usr/bin/mc mb myminio/vot-backend; # <-- vot-backend имя бакета. Не меняйте, если вы не знаете, что делаете
   /usr/bin/mc anonymous set none myminio/vot-backend; # <-- vot-backend имя бакета. Не меняйте, если вы не знаете, что делаете
db:
 ...
  environment:
    POSTGRES_DB: vot-backend # <-- имя бд по умолчанию (не трогайте, если вы не уверены в том, что делаете)
    POSTGRES_USER: postgres # <-- имя пользователя по умолчанию
    POSTGRES_PASSWORD: mysecretpassword # <-- пароль пользователя (поменяйте его)
migrator:
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
    # VOT_WORKER_API_TOKEN: <-- yandex oauth token для поддержки живых голосов
    S3_REGION: eu-central-1 # <-- регион S3
    S3_ENDPOINT: http://minio:9000 # <-- ссылка для доступа к S3
    S3_PRESIGNED_ENDPOINT: http://127.0.0.1:9000 # <-- ссылка для внешнего доступа к S3 (по которой пользователь будет получать файлы)
    S3_BUCKET: vot-backend # <-- имя бакета
    S3_ACCESS_KEY_ID: root # <-- ваш Access Key (или логин, если вы используете Minio)
    S3_SECRET_ACCESS_KEY: changeme # <-- поменяйте его, это ваш Secret Access Key (или пароль, если вы используете Minio)
    S3_FORCE_PATH_STYLE: true # <-- не использовать поддомены при составлении пути. Нужно включать для работы с Minio, а для провайдеров возможно прийдется наоброт выключить его
    REDIS_HOST: redis # <-- хост на котором работает Redis (не трогайте, если вы не уверены в том, что делаете)
    POSTGRES_NAME: vot-backend # <-- имя бд
    POSTGRES_HOST: db # <-- хост на котором работает Postgres (не трогайте, если вы не уверены в том, что делаете)
    POSTGRES_USER: postgres # <-- имя пользователя бд
    POSTGRES_PASSWORD: mysecretpassword # <-- пароль от бд (поменяйте его на тот, что используется для db выше)
```

5. Соберите образ с помощью команды:

```bash
docker compose build
```

5.1. Если у вас не получается собрать из-за ошибки, связанной с .env файлом, добавьте аргумент `--env-file nul` (для Windows) или `--env-file /dev/null` (для Linux)

```bash
docker compose --env-file /dev/null build
```

6. Запустите образ с помощью команды:

```bash
docker compose up -d
```

При первом холодном запуске могут быть ошибки, связанные с долгой инициализацией контейнера базы данных, но спустя пару автоматических рестартов все должно запуститься.

### ⚙️ Ручная установка

1. Установите PostgreSQL 16+
2. Установите Redis 6.2.0+
3. Создайте S3 хранилище у любого провайдера или разверните локально с помощью Minio
4. Установите [Bun](https://bun.sh/)
5. Клонируйте репозиторий с помощью команды:

```bash
git clone https://github.com/FOSWLY/vot-backend
```

6. Установите зависимости с помощью команды:

```bash
bun install
```

7. Переименуйте .example.env в .env и заполните его. Обязательные поля без которых сервер не будет нормально работать:

```
MEDIA_CONVERTER_HOSTNAME
MEDIA_CONVERTER_TOKEN
S3_REGION
S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
POSTGRES_HOST
POSTGRES_USER
POSTGRES_PASSWORD
REDIS_HOST
```

8. Выполните миграцию базы данных:

```bash
bun migrate
```

9. Запустите сервер

```bash
bun start
```

Либо вы можете запустить с помощью PM2:

1. Выполните стандартные шаги установки 1-8
2. Установите зависимости:

```bash
bun install -g pm2 && pm2 install pm2-logrotate
```

3. Запустите сервер

```bash
pm2 start ecosystem.config.json
```

## Примечание:

1. Если у вас заблокирован или недоступен какой-либо из используемых сервисов работоспособность не гарантируется

## S3

Поддерживаются только S3 хранилища, которые, хотя бы частично, поддерживают Presigned URL и имеют возможность отключения CORS.

Если вы не уверены, что в вашем S3 отключены CORS вам следует запустить скрипт для их отключения:

```bash
bun run s3:disable-cors
```
