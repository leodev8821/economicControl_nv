import { Router } from "express";
import { authController } from "../auth/auth.controller.js";
import { usersController } from "../controllers/auth/users.controller.js";
import { rolesController } from "../controllers/auth/roles.controller.js";
import { applicationsController } from "../controllers/auth/applications.controller.js";
import { userPermissionsController } from "../controllers/auth/user-permissions.controller.js";
import {
  decodeAccessToken,
  decodeRefreshToken,
  requireRole,
} from "@middlewares/auth.middleware.js";

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
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/profile", decodeAccessToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "No autorizado" });
  }

  res.json({
    ok: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      role_name: req.user.role_name,
      permissions: req.user.permissions,
    },
  });
});

// =================================================================
// 👨‍💻 USERS (ADMIN)
// =================================================================
authRouter.get(
  "/users",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  usersController.allUsers,
);
authRouter.get(
  "/users/:id",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  usersController.oneUser,
);
authRouter.post(
  "/users",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  usersController.createUser,
);
authRouter.put(
  "/users/:id",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  usersController.updateUser,
);
authRouter.delete(
  "/users/:id",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  usersController.deleteUser,
);

// =================================================================
// 👤 ROLES (ADMIN)
// =================================================================
authRouter.get(
  "/roles",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  rolesController.allRoles,
);

// =================================================================
// 🔐 APPLICATIONS
// =================================================================
authRouter.get(
  "/applications",
  decodeAccessToken,
  applicationsController.allApplications,
);
authRouter.get(
  "/applications/search",
  decodeAccessToken,
  applicationsController.oneApplication,
);
authRouter.post(
  "/applications",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  applicationsController.createApplication,
);
authRouter.delete(
  "/applications/:id",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  applicationsController.deleteApplication,
);

// =================================================================
// 🔐 USER PERMISSIONS
// =================================================================
// GET: Obtener permisos de un usuario
authRouter.get(
  "/permissions/user/:userId",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  userPermissionsController.getPermissionsByUser,
);

// POST: Asignar un rol a un usuario
authRouter.post(
  "/permissions",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  userPermissionsController.assignRole,
);

// POST: Verificar acceso (endpoint de utilidad)
authRouter.post(
  "/permissions/verify",
  decodeAccessToken,
  userPermissionsController.verifyAccess,
);

// DELETE: Revocar acceso
authRouter.delete(
  "/permissions/:userId/:appId",
  decodeAccessToken,
  requireRole("SuperUser", "Administrador"),
  userPermissionsController.revokeAccess,
);

export default authRouter;
