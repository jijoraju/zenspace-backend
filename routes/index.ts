import express, {Router} from "express";
import passport from "passport";
import {checkUserRole} from "../middlewares/authorization";
import {login, logout, register} from "../controllers/authController";
import {RegisterRequestSchema} from "../swagger/RegisterRequestSchema";

const router: Router = express.Router();

/**
 * @swagger
 * /register:
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
router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

// Protected route example
router.get('/admin', passport.authenticate('jwt', {session: false}), checkUserRole('admin'), (req, res) => {
    res.json({message: 'Admin area!'});
});

export default router;
