import express, {Router} from "express";
import passport from "passport";
import {checkUserRole} from "../../middlewares/authorization";
import {findAllLocations, findLocationByName} from "../../controllers/locationController";
import {searchWorkspaces} from "../../controllers/workspaceController";


const workspaceRouter: Router = express.Router();


/**
 * @swagger
 * /location:
 *   get:
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
    findAllLocations
);

/**
 * @swagger
 * /locationByName:
 *   get:
 *     summary: Find Locations by Name
 *     description: Retrieve locations that contain the provided name substring.
 *     tags:
 *       - Location
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name to search for within location names.
 *     responses:
 *       200:
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationResponse'
 *       400:
 *         description: Bad request. 'name' parameter is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericResponse'
 *       404:
 *         description: No locations found.
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
    "/locationByName",
    findLocationByName
);

workspaceRouter.get("/workspace/search", searchWorkspaces);

export default workspaceRouter;

