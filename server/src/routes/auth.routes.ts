import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { decodeUser, verifyLogin, verifySudoRole } from '../middlewares/decode.middleware';

const authRouter : Router = Router();

// =================================================================
// 🔑 LOGIN
// =================================================================
authRouter.post('/login', authController.loginUser);
authRouter.get('/refresh-token', authController.refreshToken);
authRouter.get('/logout', authController.logoutUser);

// Rutas Protegidas (requieren Access Token en el header 'Authorization: Bearer <token>')
authRouter.get('/profile', decodeUser, verifyLogin, (req, res) => {
    // Aquí puedes acceder a req.username, req.userRole, etc.
    res.json({ username: req.username, role: req.userRole });
});

// Rutas de Administración (requieren Access Token + SuperUser Role)
authRouter.get('/admin/users', decodeUser, verifySudoRole, (req, res) => {
    // Lógica para obtener usuarios
    res.send('Acceso de administrador concedido');
});

export default authRouter;