# 1.3.0

- (!) Path `/video-translate/translate` body has migrated from camelCase to snake_case. It needs to unify all requests and responses body. Now, it's available if you set "X-Use-Snake-Case": "Yes" to headers, but in the next major release support for camelCase will be removed
- Added support get yandex subtitles
- Added `logToFile` option to config (default: false)
- Added `forcePathStyle` option to config (default: false)
- Added `preSignedEndpoint` option to config (default: equal s3 endpoint)
- Added minio container to default docker compose
- Migrated from uuid (v7) to bun (randomUUIDv7)
- Fixed "Possible error: null" if media converter is unavailable
- Fixed wrong migration name `2025-09-01-downgrade-id-to-int` -> `2025-01-09-downgrade-id-to-int` (if you get error on `migrate:up`, try to run again or manually delete old migration name from `kysely_migration` in database)
- Change default user agent to user agent from vot.js
- Bump depends

# 1.2.1

- The database schema (vot_translations) has been changed

  `id` BigInt -> integer

- Added mass delete translations with `DELETE /v1/video-translation/translate` (auth required)
- Improved documentation
- Fixed empty documentation on `GET /v1/docs`
- Fixed typings for `TranslatedService`, `FromLang` and `ToLang`
- Updated Scalar API Reference library to always use latest version
- Updated Elysia to 1.2.6
- Updated other depends

# 1.2.0

- The database schema (vot_translations) has been changed

  `id` serial -> BigInt (identity column)
  `created_at` timestamp -> timestamptz

- Migrated from `vot.js` to [@vot.js/node](https://github.com/FOSWLY/vot.js)
- Migrated to /v2 API of [translate-backend](https://github.com/FOSWLY/translate-backend)
- Added config validation schema
- Replaced `console.error` to `log.error` in `TranslateTextService` class and in `generatePreSigned` func
- Refactored logic for `getAll` translations from cache
- Updated default CORS methods
- Updated Scalar CDN link
- Updated depends
- Improved some typings

# 1.1.3

- Added support Artstation

# 1.1.2

- Removed eslint-plugin-sonarjs
- Change VOTClient to VOTWorkerClient

# 1.1.1

- Improved typings

# 1.1.0

- Added support Kick stream
- Added endpoint for get list of translations with pagination (auth required)
- Added endpoint for get translation info by id (auth required)
- Added error handling for delete translation
- Added delete audio from S3 after delete from db

# 1.0.1

- Added customize loki label
- Added delete outdated audio files from S3
- Added EpicGames support
- Added 9animeTV support
- Added Docker compose config
- Added set app title, description and contact_email from env
- Updated media converter interface

# 1.0.0

- Initial release
