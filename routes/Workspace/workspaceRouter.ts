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

/**
 * @swagger
 * /workspace/search:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Search for workspaces
 *     description: Retrieve a list of workspaces based on provided search criteria.
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         description: The ID of the location to filter workspaces.
 *         required: true
 *       - in: query
 *         name: workspace_type
 *         schema:
 *           type: string
 *         description: Type of the workspace to filter.
 *         required: true
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Maximum price per day.
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum average rating.
 *       - in: query
 *         name: noOfSpace
 *         schema:
 *           type: number
 *         description: Total space required.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for availability check.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for availability check.
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         description: Page size
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field name for sorting
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Sorting oder for the given field
 *     responses:
 *       200:
 *         description: A list of workspaces that match the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkSpaceSearchResponse'
 *       400:
 *         description: Bad request (e.g., invalid workspace type or location ID).
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
workspaceRouter.get("/workspace/search", searchWorkspaces);

export default workspaceRouter;

