# Dockerfile para Backend Node.js
FROM node:18-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Build da aplicação (se necessário compilar TypeScript)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compilar TypeScript para JavaScript (se necessário)
# RUN npm run build

# Imagem de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copiar node_modules e código
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3001

ENV PORT 3001

# Usar ts-node para rodar TypeScript diretamente
CMD ["npx", "ts-node", "src/app.ts"]

