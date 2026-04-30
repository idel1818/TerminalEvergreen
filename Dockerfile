FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY client/package*.json ./client/
RUN cd client && npm ci

COPY . .
RUN cd client && npm run build

RUN npm prune --production

FROM node:22-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/client/dist ./client/dist
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/gtm-terminal.db

EXPOSE 3000

CMD ["node", "server/index.js"]
