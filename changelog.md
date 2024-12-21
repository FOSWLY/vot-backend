# 1.2.0

- The database schema has been changed

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
