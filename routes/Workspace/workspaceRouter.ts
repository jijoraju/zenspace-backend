import express, {Router} from "express";
import passport from "passport";
import {checkUserRole} from "../../middlewares/authorization";
import {findAllLocations} from "../../controllers/locationController";


const workspaceRouter: Router = express.Router();


/**
 * @swagger
 * /location:
 *   get:
 *     security:
 *       - JWT: []
 *     tags:
 *       - Location
 *     summary: get all locations
 *     description: returns all the locations available
 *     responses:
 *       200:
 *         description: all the locations with details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No Location found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 *       500:
 *         description: Internal Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 */
workspaceRouter.get(
    "/location",
    passport.authenticate('jwt', {session: false}),
    findAllLocations
);

export default workspaceRouter;

