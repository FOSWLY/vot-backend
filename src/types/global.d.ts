declare module "bun" {
  interface Env {
    SERVICE_HOST: string;
    SERVICE_PORT: number;
    SERVICE_TOKEN: string;
    APP_NAME: string;
    APP_DESC: string;
    APP_CONTACT_EMAIL: string;
    MEDIA_CONVERTER_HOSTNAME: string;
    MEDIA_CONVERTER_TOKEN: string;
    TRANSLATE_TEXT_HOSTNAME: string;
    POSTGRES_NAME: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_USER: string;
    REDIS_PASSWORD: string;
    S3_REGION: string;
    S3_ENDPOINT: string;
    S3_PRESIGNED_ENDPOINT: string;
    S3_BUCKET: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_FORCE_PATH_STYLE: string;
    LOG_TO_FILE: string;
    LOKI_HOST: string;
    LOKI_USER: string;
    LOKI_PASSWORD: string;
    LOKI_LABEL: string;
    NAVIGATION_DEFAULT_LIMIT: number;
    NAVIGATION_MAX_LIMIT: number;
    NODE_ENV: string;
  }
}
