# 1. Etapa de base
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add -g turbo

# 2. Etapa de "Pruning" (Limpieza)
FROM base AS pruner
WORKDIR /app
COPY . .
# Extrae solo lo necesario para el servidor
RUN turbo prune @economic-control/server --docker

# 3. Etapa de Instalación y Build
FROM base AS builder
WORKDIR /app
# Copia los archivos podados (json y lockfiles)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copia el código fuente y compila
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@economic-control/server

# 4. Etapa de Producción (Imagen final ligera)
FROM base AS runner
WORKDIR /app

# Crear usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copiar solo los artefactos necesarios
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/package.json ./package.json
COPY --from=builder /app/packages/shared/package.json ../shared/package.json
# Nota: Necesitarás copiar las node_modules de producción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules

# Exponer el puerto (ajustar según tu env)
EXPOSE 3000

CMD ["node", "dist/app.js"]