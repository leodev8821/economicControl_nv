# economicControl_nv

An app to manage income/outcome for Nueva Vida Logroño

# Tech Stack

TypeScript, React, Vite, MySQL and Postgres, Node.js, Express, Zod, MUI.

# Project Structure

- packages/server: Backend server
- packages/shared: Shared code between frontend and backend
- packages/frontend: Frontend app

# How to run

1. Install dependencies: `pnpm install`
2. Setup databases: `pnpm --filter @economic-control/server run db:setup`
3. Run server and client: `pnpm dev`

# Environment variables

- .env

# Env Structure

- # Server
- SERVER_HOST=your-server-host
- SERVER_PORT=your-server-port

- # Database
- DB_DB=your-db-name
- DB_USER=your-db-user
- DB_PASSWORD=your-db-password
- DB_HOST=your-db-host
- DB_PORT=your-db-port

- # Superuser
- SUDO_ROLE=SuperUser
- SUDO_USERNAME=your-sudo-username
- SUDO_PASSWORD=your-sudo-password
- SUDO_FIRSTNAME=your-sudo-firstname
- SUDO_LASTNAME=your-sudo-lastname
- SUDO_IS_VISIBLE=true

- # Security
- SECRET_KEY=your-secret-key
- REFRESH_SECRET=your-refresh-secret
- ACCESS_TOKEN_EXPIRATION=your-access-token-expiration
- REFRESH_TOKEN_EXPIRATION=your-refresh-token-expiration

- # Node
- NODE_ENV=your-node-env

- # CORS
- CORS_ORIGIN=your-cors-origin
