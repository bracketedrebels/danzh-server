FROM node:slim as api-base
ENV NODE_ENV=production
WORKDIR /home/node/app
COPY "package*.json" ./
RUN npm install
COPY . ./

FROM rethinkdb:latest as db-base
RUN apt-get update
RUN apt-get install -y curl

FROM api-base as production
ENV NODE_PATH=./build
RUN npm run build