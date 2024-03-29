FROM node:16 AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

FROM satantime/puppeteer-node:16
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
RUN yarn install --production
EXPOSE 9000
CMD ["node", "dist/server.js"]
