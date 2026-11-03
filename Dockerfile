# --- ETAPA 1: Base ---
# Ejecuta `docker inspect --format='{{index .RepoDigests 0}}' node:22-slim` para actualizar este hash
FROM node:22-slim@sha256:7bc0f8252277d33eb4fdf569c735d46ec8787c8052cf7c1f80219c6934c9c2dd AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:/pnpm/bin:$PATH"
RUN corepack enable

# --- ETAPA 2: Pruning (Podado) ---
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@2.10.5
COPY . .
RUN turbo prune @economic-control/server --docker

# --- ETAPA 3: Builder ---
FROM base AS builder
WORKDIR /app

# Copia los archivos de configuración
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Instalamos todo para poder compilar
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./ 

RUN pnpm install --frozen-lockfile

# Usamos --force para ignorar la caché de Turbo
RUN pnpm turbo run build --filter=@economic-control/shared --force
RUN pnpm --filter @economic-control/server run build --force

# Limpiamos devDependencies para que no pasen al runner
RUN CI=true pnpm install --prod --frozen-lockfile

# --- ETAPA 4: Runner (Imagen Final) ---
FROM base AS runner
WORKDIR /app

# Oculta stack traces y optimiza Express.js
ENV NODE_ENV=production

# Usuarios de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copiamos las dependencias instaladas asignando propiedad estricta
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json .

# Copiamos el servidor y el paquete compartido asignando propiedad estricta
COPY --from=builder --chown=expressjs:nodejs /app/packages/server ./packages/server
COPY --from=builder --chown=expressjs:nodejs /app/packages/shared ./packages/shared

USER expressjs
EXPOSE 3000

WORKDIR /app/packages/server

CMD ["node", "dist/app.js"]