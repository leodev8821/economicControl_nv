import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { usersController } from "../controllers/users.controller";
import { decodeUser, verifyLogin, verifySudoRole } from '../middlewares/decode.middleware';

const authRouter : Router = Router();

// =================================================================
// 🔑 LOGIN
// =================================================================
authRouter.post('/login', authController.loginUser);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logoutUser);

// Rutas Protegidas (requieren Access Token en el header 'Authorization: Bearer <token>')
authRouter.get('/profile', decodeUser, verifyLogin, (req, res) => {
    // Aquí puedes acceder a req.username, req.userRole, etc.
    res.json({ id: req.id, username: req.username, role: req.userRole, first_name: req.first_name, last_name: req.last_name });
});

// =================================================================
// 👨‍💻 USUARIOS (USERS)
// Requiere verifySudoRole
// =================================================================
authRouter.get('/users', decodeUser, verifySudoRole, usersController.allUsers);
authRouter.get('/users/:id', decodeUser, verifySudoRole, usersController.oneUser);
authRouter.post('/users/new-user', decodeUser, verifySudoRole, usersController.createUser);
authRouter.put('/users/:id', decodeUser, verifySudoRole, usersController.updateUser);
authRouter.delete('/users/:id', decodeUser, verifySudoRole, usersController.deleteUser);

export default authRouter;