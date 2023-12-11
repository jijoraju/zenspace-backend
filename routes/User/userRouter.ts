import express, {Router} from "express";
import passport from "passport";
import {checkUserRole} from "../../middlewares/authorization";
import workspaceRouter from "../Workspace/workspaceRouter";
import {getUserProfile} from "../../controllers/userController";

const userRouter: Router = express.Router();


/**
 * @swagger
 * /user/profile:
 *   get:
 *     security:
 *       - JWT: []
 *     summary: Retrieve specific profile data for the logged-in user
 *     description: Retrieves profile details of the logged-in user.
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Successfully retrieved profile details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 */
workspaceRouter.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    getUserProfile
);

export default workspaceRouter;

