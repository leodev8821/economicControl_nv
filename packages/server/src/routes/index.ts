import { Router } from "express";
import authRouter from "./auth.routes.js";
import financeRouter from "./finance.routes.js";
import consolidationRouter from "./consolidation.routes.js";
import { decodeAccessToken, checkAppAccess } from "../auth/auth.middleware.js";

const mainRouter: Router = Router();

// 🔑 AUTH: Login + Users + Roles + Applications + Permissions
// Nota: Las rutas internas manejan su propia seguridad (algunas son públicas, otras requieren token/role)
mainRouter.use("/auth", authRouter);

// 💰 FINANCE: Protegida (Token + Permiso Finance)
mainRouter.use("/finance", decodeAccessToken, checkAppAccess(2), financeRouter);

// 🤝 CONSOLIDATION: Protegida (Token + Permiso Consolidation)
mainRouter.use(
  "/consolidation",
  decodeAccessToken,
  checkAppAccess(3),
  consolidationRouter,
);

export default mainRouter;
