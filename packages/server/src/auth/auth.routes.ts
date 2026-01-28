import { Router } from "express";
import { authController } from "./auth.controller.js";
import { decodeAccessToken, decodeRefreshToken } from "./auth.middleware.js";

const authRouter: Router = Router();

// =================================================================
// 🔑 LOGIN / LOGOUT / REFRESH
// =================================================================
authRouter.post("/login", authController.loginUser);
authRouter.post(
  "/refresh-token",
  decodeRefreshToken,
  authController.refreshToken,
);
authRouter.post("/logout", authController.logoutUser);
authRouter.get("/profile", decodeAccessToken, (req, res) => {
  res.json({
    id: req.id,
    username: req.username,
    role: req.userRole,
  });
});

export default authRouter;
