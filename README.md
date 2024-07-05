# [FOSWLY] VOT Backend

Сервер для расширения списка поддерживаемых сайтов для voice-over-translation.

## Установка:

1. Разверните сервер [media-converter-backend](https://github.com/FOSWLY/media-converter-backend). Необходимо для конвертации файлов
2. Разверните сервер [translate-backend](https://github.com/FOSWLY/translate-backend). Необходимо для перевода текста без ограничений
3. Установите PostgreSQL 16+
4. Установите Redis 6.2.0+
5. Создайте S3 хранилище у любого провайдера или разверните локально с помощью Minio
6. Установите [Bun](https://bun.sh/)
7. Установите зависимости с помощью команды

```bash
bun install
```

8. Переименуйте .example.env в .env и заполните его
9. Запустите сервер

```bash
bun start
```

Если вы хотите использовать PM2:

1. Установите зависимости:

```bash
bun install -g pm2 && pm2 install pm2-logrotate
```

2. Запустите сервер

```bash
pm2 start ecosystem.config.cjs
```

## Примечание:

1. Если у вас заблокирован какой-либо из сервисов, то гарантировать работоспособность я не могу

## Архитектурная схема

<img width="4213" alt="vot backend" src="https://github.com/FOSWLY/vot-backend/assets/62353659/a762511c-be29-4521-8f63-2dfb2cc8cfe7">
