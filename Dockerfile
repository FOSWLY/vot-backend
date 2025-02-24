FROM oven/bun:latest AS base
WORKDIR /usr/src/app

FROM base AS release
COPY package.json bun.lock tsconfig.json ./
COPY src src
COPY scripts scripts
RUN bun install

# run the app
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "start:docker" ]