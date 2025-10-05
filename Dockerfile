FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
