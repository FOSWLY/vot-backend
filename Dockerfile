# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
#FROM base AS install
#RUN mkdir -p /temp/dev
#COPY package.json bun.lockb /temp/dev/
#RUN cd /temp/dev && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS release
# COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun install
COPY node_modules node_modules

# run the app
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "start:docker" ]