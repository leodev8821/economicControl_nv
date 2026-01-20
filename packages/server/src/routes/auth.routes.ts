import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { usersController } from "../controllers/users.controller.js";
import {
  decodeAccessToken,
  decodeRefreshToken,
  verifyLogin,
  verifySudoRole,
} from "../middlewares/decode.middleware.js";

const authRouter: Router = Router();

// =================================================================
// 🔑 LOGIN / LOGOUT / REFRESH
// =================================================================
authRouter.post("/login", authController.loginUser);
authRouter.post(
  "/refresh-token",
  decodeRefreshToken,
  authController.refreshToken
);
authRouter.post("/logout", authController.logoutUser);

// Rutas Protegidas (requieren Access Token en el header 'Authorization: Bearer <token>')
authRouter.get("/profile", decodeAccessToken, verifyLogin, (req, res) => {
  // Aquí puedes acceder a req.username, req.userRole, etc.
  res.json({
    id: req.id,
    username: req.username,
    role: req.userRole,
    first_name: req.first_name,
    last_name: req.last_name,
  });
});

// =================================================================
// 👨‍💻 USUARIOS (USERS)
// Requiere verifySudoRole
// =================================================================
authRouter.get(
  "/users",
  decodeAccessToken,
  verifySudoRole,
  usersController.allUsers
);
authRouter.get(
  "/users/:id",
  decodeAccessToken,
  verifySudoRole,
  usersController.oneUser
);
authRouter.post(
  "/users/new-user",
  decodeAccessToken,
  verifySudoRole,
  usersController.createUser
);
authRouter.put(
  "/users/:id",
  decodeAccessToken,
  verifySudoRole,
  usersController.updateUser
);
authRouter.delete(
  "/users/:id",
  decodeAccessToken,
  verifySudoRole,
  usersController.deleteUser
);

export default authRouter;
