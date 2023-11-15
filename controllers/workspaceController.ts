import {Request, Response} from "express";
import {$Enums, Booking, PrismaClient} from "@prisma/client";
import {
    BookingDetail, ChargeDetail,
    CheckoutRequest, WorkspaceDetails,
    WorkspaceFull,
    WorkSpaceWithBookings,
    WorkSpaceWithOnlyBookings
} from "../types/types";
import Stripe from "stripe";

import WorkspaceType = $Enums.WorkspaceType;

const prisma: PrismaClient = new PrismaClient();

const DOMAIN_URL: string = process.env.DOMAIN_URL || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

const stripe: Stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    typescript: true,
});

export const searchWorkspaces = async (req: Request, res: Response) => {

    const {
        locationId: locationIdString,
        workspace_type,
        price,
        rating,
        noOfSpace,
        startDate,
        endDate
    } = req.query;

    const locationId: number = Number(locationIdString);
    const workspaceType: WorkspaceType = workspace_type as WorkspaceType;
    const pricePerDay: number | undefined = price ? Number(price) : undefined;
    const minRating: number | undefined = rating ? Number(rating) : undefined;
    const fromDate: string | undefined = startDate ? String(startDate) : undefined;
    const toDate: string | undefined = endDate ? String(endDate) : undefined;
    const noOfSpaces: number | undefined = noOfSpace ? Number(noOfSpace) : 0;

    const page: number = req.query.page ? Number(req.query.page) : 1;
    const pageSize: number = req.query.pageSize ? Number(req.query.pageSize) : 10; // Default page size
    const skip = (page - 1) * pageSize;

    const sort: keyof WorkSpaceWithBookings = (req.query.sort as keyof WorkSpaceWithBookings) || 'name';
    const order: 'asc' | 'desc' = req.query.order === 'desc' ? 'desc' : 'asc';


    if (workspace_type && !Object.values(WorkspaceType).includes(workspace_type as WorkspaceType)) {
        res.status(400).json({message: 'Invalid workspace type'});
        return;
    }

    if (isNaN(locationId)) {
        res.status(400).json({message: 'Invalid locationId parameter'});
        return;
    }

    try {
        // check the location is valid or not
        const locationResult = await prisma.location.findUnique({
                where: {location_id: locationId},
            }
        );

        if (locationResult == undefined) {
            res.status(400).json({message: 'Invalid location'});
            return;
        }

        let searchResults: WorkSpaceWithBookings[] = await prisma.workspace.findMany({
            where: {
                location_id: locationId,
                workspace_type: workspaceType,
                price_per_day: {
                    lte: pricePerDay,
                },
            },
            include: {
                reviews: true,
                workspaceAddress: true,
                location: true,
                bookings: true
            }
        });

        if (minRating) {
            searchResults = searchResults.filter(workspace => {
                const totalRating: number = workspace.reviews
                    .reduce((sum, review) => sum + review.rating, 0.0);
                const avgRating: number = totalRating / workspace.reviews.length || 0.0;
                return avgRating >= minRating;
            });
        }
        searchResults = searchResults.filter(workspace => {
            let bookedSpaces;

            if (workspaceType == WorkspaceType.ONE_DAY) {
                bookedSpaces = spacesBooked(workspace.bookings, (booking: Booking) => {
                    if (fromDate) {
                        return Boolean(fromDate) && new Date(booking.start_date).toDateString() === new Date(fromDate).toDateString();
                    } else {
                        return false;
                    }
                });
            } else {
                bookedSpaces = spacesBooked(workspace.bookings, (booking: Booking) => {
                    if (fromDate && toDate) {
                        const bookingStart = new Date(booking.start_date);
                        const bookingEnd = new Date(booking.end_date);
                        return Boolean(bookingStart < new Date(toDate) && bookingEnd > new Date(fromDate));
                    } else {
                        return false;
                    }
                });
            }

            const availableSpaces = workspace.no_of_spaces - bookedSpaces;
            return availableSpaces >= noOfSpaces;
        });

        let finalWorkspaceIds: number[] = searchResults.map(r => r.workspace_id);

        const totalCount: number = finalWorkspaceIds.length;

        searchResults = await prisma.workspace.findMany({
            where: {
                workspace_id: {
                    in: finalWorkspaceIds
                }
            },
            include: {
                reviews: true,
                workspaceAddress: true,
                location: true,
                bookings: true
            },
            skip,
            take: pageSize,
            orderBy: {
                [sort || 'name']: order
            }
        });

        const modifiedResponse: Omit<WorkSpaceWithBookings, 'bookings'>[] = searchResults.map(
            ({
                 bookings,
                 ...otherProps
             }) => otherProps
        );

        const totalPages: number = Math.ceil(totalCount / pageSize);

        return res.json({
            success: true,
            meta: {
                currentPage: page,
                pageSize: pageSize,
                totalResults: totalCount,
                totalPages: totalPages,
                sortBy: sort,
                sortOrder: order
            },
            data: modifiedResponse
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }

}

function spacesBooked(bookings: Booking[], conditionCheck: (booking: Booking) => boolean): number {
    return bookings.reduce((sum: number, booking: Booking): number => {
        if (conditionCheck(booking)) {
            return sum + booking.no_of_space;
        }
        return sum;
    }, 0);
}

export const getWorkspaceById = async (req: Request, res: Response) => {
    const workspaceId: number = Number(req.params.workspaceId);

    try {
        const workspace: WorkspaceFull = await prisma.workspace.findUnique({
            where: {
                workspace_id: workspaceId,
            },
            include: {
                reviews: true,
                workspaceAddress: true,
                location: true,
                workspaceAmenities: {
                    include: {
                        amenity: true,
                    },
                },
                workspacePhotos: true
            }
        });

        if (!workspace) {
            return res.status(404).json({message: 'Workspace not found'});
        }

        // Calculating the average rating
        const totalRating: number = workspace.reviews
            .reduce((sum, review) => sum + review.rating, 0.0);
        const avgRating: number = totalRating / workspace.reviews.length || 0.0;

        const photoUrls: string[] = workspace.workspacePhotos.map(photo => photo.photo_url);
        const amenitiesDescriptions = workspace.workspaceAmenities.map(amenity => amenity.amenity.description);

        const {workspacePhotos, workspaceAmenities, ...workspaceWithAmenities} = workspace;

        const modifiedWorkspace = {
            ...workspaceWithAmenities,
            amenities: amenitiesDescriptions,
            avgRating,
            photos: photoUrls
        };

        return res.json({
            success: true,
            data: modifiedWorkspace
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
}


export const checkout = async (req: Request, res: Response) => {
    try {

        if (!DOMAIN_URL) return res.status(500).json({ error: 'Invalid domain payment cannot process' });

        const checkoutData: CheckoutRequest = req.body;
        const bookingDetails: BookingDetail = checkoutData.bookingDetail;
        const chargeDetail: ChargeDetail = checkoutData.chargeDetail;
        const workspaceDetails : WorkspaceDetails = checkoutData.workspace;

        if (!workspaceDetails.id) return res.status(404).json({ error: 'Invalid workspace' });

        const workspace = await prisma.workspace.findUnique({
            where: { workspace_id: workspaceDetails.id },
            include: { bookings: true }
        });

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const isAvailable: Boolean = checkAvailability(
            workspace,
            bookingDetails.dateSelected.start,
            bookingDetails.dateSelected.end,
            bookingDetails.peopleCount,
            workspace.workspace_type
        );

        if (!isAvailable) {
            return res.status(400).json({ error: 'No vacancy available for the selected criteria' });
        }

        const { productName, prodDesc, totalAmount } = getPaymentData(workspace, bookingDetails, chargeDetail);

        const session = await createCheckoutSession(productName, prodDesc, totalAmount);
        return session.url
            ? res.status(200).json({ success: true, data: { url: session.url } })
            : res.status(500).json({ error: 'Failed to create Stripe session' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server error' });
    }
};

function getPaymentData(workspace: WorkSpaceWithOnlyBookings, bookingDetail: BookingDetail, chargeDetail: ChargeDetail) {
    const productName = `Booking for ${workspace.workspace_type}`;
    const startDate = new Date(bookingDetail.dateSelected.start);
    const endDate = new Date(bookingDetail.dateSelected.end);
    const prodDesc = workspace.workspace_type === 'ONE_DAY'
        ? `Date: ${bookingDetail.dateSelected.start}, Number of Persons: ${bookingDetail.peopleCount}`
        : `Dates: ${bookingDetail.dateSelected.start} to ${bookingDetail.dateSelected.end}, Number of Persons: ${bookingDetail.peopleCount}`;

    const daysDifference = calculateDaysDifference(startDate, endDate, workspace.workspace_type);
    const amount = workspace.price_per_day * bookingDetail.peopleCount * daysDifference;
    const taxAmount = amount * 0.13;
    const totalAmount = amount + taxAmount;

    console.log(`Amount = ${amount}, Tax Amount = ${taxAmount}, Total Amount = ${totalAmount}`);

    if (amount !== chargeDetail.charge || taxAmount !== chargeDetail.tax || totalAmount !== chargeDetail.Total) {
        throw new Error("Price mismatch");
    }
    return { productName, prodDesc, totalAmount };
}

function calculateDaysDifference(startDate: Date, endDate: Date, workspaceType: WorkspaceType): number {
    if (workspaceType === WorkspaceType.ONE_DAY) {
        return 1;
    } else {
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 because it's inclusive of both start and end days
    }
}


async function createCheckoutSession(productName: string, prodDesc: string, totalAmount: number) {
    return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'cad',
                product_data: { name: productName, description: prodDesc },
                unit_amount: totalAmount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${DOMAIN_URL}/checkout?result=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN_URL}/checkout?result=cancel&session_id={CHECKOUT_SESSION_ID}`,
    });
}

function checkAvailability(workspace: WorkSpaceWithOnlyBookings, startDate: string, endDate: string, noOfPeople: number, workspaceType: WorkspaceType): boolean {
    let bookedSpaces = spacesBooked(workspace.bookings, (booking: Booking) => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        if (workspaceType === WorkspaceType.ONE_DAY) {
            return requestedStart.toDateString() === bookingStart.toDateString();
        } else {
            return bookingStart < requestedEnd && bookingEnd > requestedStart;
        }
    });

    const availableSpaces = workspace.no_of_spaces - bookedSpaces;
    return availableSpaces >= noOfPeople;
}

export const successTest = async (req: Request, res: Response) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json(session);
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'});
    }
}
