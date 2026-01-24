# --- ETAPA 1: Base ---
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- ETAPA 2: Pruning (Podado) ---
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@2.7.5
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
RUN pnpm turbo run build --filter=@economic-control/server --force

# Limpiamos devDependencies para que no pasen al runner (Opcional pero recomendado)
RUN pnpm install --prod --frozen-lockfile

# --- ETAPA 4: Runner (Imagen Final) ---
FROM base AS runner
WORKDIR /app

# Usuarios de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copiamos las dependencias instaladas del monorepo
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

# Copiamos el servidor y el paquete compartido
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/shared ./packages/shared

USER expressjs
EXPOSE 3000

WORKDIR /app/packages/server

CMD ["node", "dist/app.js"]