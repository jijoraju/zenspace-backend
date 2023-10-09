import express, {Router} from "express";
import passport from "passport";
import {login, logout, register} from "../../controllers/authController";
import {checkUserRole} from "../../middlewares/authorization";


const authRouter: Router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Creates a new user with the given registration details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: true.
 *       500:
 *         description: Internal Server Error or User type not found.
 */
authRouter.post('/register', register);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login for a user
 *     description: Login with user credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal Server Error or JWT_SECRET not defined.
 */
authRouter.post('/login', login);


/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags:
 *       - Users
 *     summary: Logout a user
 *     description: Logout the current user and end their session.
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 */
authRouter.get('/logout', logout);

// Protected route example
authRouter.get('/admin', passport.authenticate('jwt', {session: false}), checkUserRole('admin'), (req, res) => {
    res.json({message: 'Admin area!'});
});


export default authRouter;
