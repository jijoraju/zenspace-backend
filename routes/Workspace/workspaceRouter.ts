import express, {Router} from "express";
import passport from "passport";
import {checkUserRole} from "../../middlewares/authorization";
import {findAllLocations, findLocationByName} from "../../controllers/locationController";
import {
    checkout,
    confirmBooking, getUserBookingDetails, getUserBookings,
    getWorkspaceById,
    searchWorkspaces,
} from "../../controllers/workspaceController";


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


/**
 * @swagger
 * /workspace/{workspaceId}:
 *   get:
 *     summary: Retrieve Workspace by ID
 *     description: Fetches details of a workspace by its ID, including associated reviews, address, location, amenities, and photos. Also computes the average rating.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the workspace to fetch.
 *     responses:
 *       200:
 *         description: Successful response.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceDetailsResponse'
 *       404:
 *         description: Workspace not found.
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
workspaceRouter.get("/workspace/:workspaceId", getWorkspaceById);

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Process a workspace booking checkout
 *     description: Creates a Stripe checkout session for booking a workspace. Validates workspace availability, calculates the total cost, and returns a session URL for payment.
 *     tags:
 *       - Checkout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       200:
 *         description: Successful response with the URL for the Stripe checkout session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: No vacancy available for the selected criteria or invalid data in request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericErrorResponse'
 *       404:
 *         description: Workspace not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericErrorResponse'
 *       500:
 *         description: Internal server error or invalid domain configuration.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericErrorResponse'
 */
workspaceRouter.post('/checkout',passport.authenticate('jwt', {session: false}), checkout)

/**
 * @swagger
 * /confirmBooking/{sessionId}:
 *   post:
 *     summary: Confirm a booking
 *     description: Confirms a booking after successful payment processing using the Stripe session ID.
 *     tags:
 *       - Booking
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe session ID for the payment.
 *     responses:
 *       200:
 *         description: Booking successfully confirmed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfirmBookingResponse'
 *       400:
 *         description: Payment not successful or booking reference not found.
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
workspaceRouter.get('/confirm-booking/:sessionId', passport.authenticate('jwt', {session: false}), confirmBooking)

/**
 * @swagger
 * /booking-summery:
 *   get:
 *     security:
 *       - JWT: []
 *     summary: Retrieve bookings for the logged-in user
 *     description: Retrieves all bookings made by the logged-in user, categorized into upcoming and past bookings.
 *     tags:
 *       - Booking
 *     responses:
 *       200:
 *         description: Successfully retrieved bookings.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBookingsResponse'
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
workspaceRouter.get('/booking-summery', passport.authenticate('jwt', { session: false }), getUserBookings);


/**
 * @swagger
 * /booking-summary/{bookingReference}:
 *   get:
 *     security:
 *       - JWT: []
 *     summary: Retrieve specific booking details for the logged-in user
 *     description: Retrieves details of a specific booking made by the logged-in user by the given booking reference.
 *     tags:
 *       - Booking
 *     parameters:
 *       - in: path
 *         name: bookingReference
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking reference number
 *     responses:
 *       200:
 *         description: Successfully retrieved booking details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBookingsResponse'
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
    '/booking-summary/:bookingReference',
    passport.authenticate('jwt', { session: false }),
    getUserBookingDetails
);


export default workspaceRouter;

