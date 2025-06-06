FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock
COPY tsconfig.json tsconfig.json

RUN bun install --frozen-lockfile

COPY src src

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --external "@vaylo/pino" \
    --external pino \
    --external pino-pretty \
    --outfile server \
    ./src/index.ts

FROM oven/bun:latest AS migrator

WORKDIR /app

COPY --from=builder /app ./

CMD ["bun", "run", "migrate:up"]

FROM debian:stable-slim as final

WORKDIR /app

COPY --from=builder /app/server server
COPY --from=builder /app/node_modules node_modules

ENV NODE_ENV=production

EXPOSE 3001/tcp
CMD  [ "./server" ]