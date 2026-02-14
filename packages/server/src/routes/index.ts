import { Router } from "express";
import authRouter from "./auth.routes.js";
import financeRouter from "./finance.routes.js";
import consolidationRouter from "./consolidation.routes.js";
import { decodeAccessToken, checkAppAccess } from "../auth/auth.middleware.js";
import { APP_IDS } from "../shared/app.constants.js";

const mainRouter: Router = Router();

// 🔑 AUTH: Login + Users + Roles + Applications + Permissions
mainRouter.use("/auth", authRouter);

const appRouters = [
  { path: "/finance", appId: APP_IDS.FINANCE, router: financeRouter },
  {
    path: "/consolidation",
    appId: APP_IDS.CONSOLIDATION,
    router: consolidationRouter,
  },
];

appRouters.forEach(({ path, appId, router }) => {
  mainRouter.use(path, decodeAccessToken, checkAppAccess(appId), router);
});

export default mainRouter;
