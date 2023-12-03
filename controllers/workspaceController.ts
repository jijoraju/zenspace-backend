import {Request, Response} from "express";
import {$Enums, Booking, PrismaClient} from "@prisma/client";
import {
    BookingDetail,
    BookingDetails,
    ChargeDetail,
    CheckoutRequest,
    WorkspaceDetails,
    WorkspaceFull,
    WorkSpaceWithBookings,
    WorkSpaceWithOnlyBookings
} from "../types/types";
import Stripe from "stripe";
import WorkspaceType = $Enums.WorkspaceType;
import BookingStatus = $Enums.BookingStatus;

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
                bookings: {
                    where: {
                        status: {
                            not: BookingStatus.CANCELLED
                        }
                    }
                }
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
                        const bookingEnd = booking.end_date ? new Date(booking.end_date) : bookingStart;
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

function getWorkspaceWithDetails(workspace: WorkspaceFull) {
    if (workspace != null) {
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
        return modifiedWorkspace;
    } else {
        throw Error("Unable to get workspace details");
    }
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

        const modifiedWorkspace = getWorkspaceWithDetails(workspace);

        return res.json({
            success: true,
            data: modifiedWorkspace
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: `Internal server error ${error}`});
    }
}


export const checkout = async (req: any, res: any) => {
    try {

        if (!DOMAIN_URL) return res.status(500).json({error: 'Invalid domain payment cannot process'});

        const checkoutData: CheckoutRequest = req.body;
        const bookingDetails: BookingDetail = checkoutData.bookingDetail;
        const chargeDetail: ChargeDetail = checkoutData.chargeDetail;
        const workspaceDetails: WorkspaceDetails = checkoutData.workspace;

        if (!req.user) {
            return res.status(401).json({error: 'User not authenticated'});
        }

        const userId: number = req.user.user_id;
        const email: string = req.user.email;

        const LOCAL_URL = (checkoutData.domain && checkoutData.domain.includes('127.0.0.1:5173')) ? 'http://127.0.0.1:5173' : '';

        if (!workspaceDetails.id) return res.status(404).json({error: 'Invalid workspace'});

        const workspace = await prisma.workspace.findUnique({
            where: {workspace_id: workspaceDetails.id},
            include: {
                bookings: {
                    where: {
                        status: {
                            not: BookingStatus.CANCELLED
                        }
                    }
                }
            }
        });

        if (!workspace) {
            return res.status(404).json({error: 'Workspace not found'});
        }

        const isAvailable: Boolean = checkAvailability(
            workspace,
            bookingDetails.dateSelected.start,
            bookingDetails.dateSelected.end,
            bookingDetails.peopleCount,
            workspace.workspace_type
        );

        if (!isAvailable) {
            return res.status(400).json({error: 'No vacancy available for the selected criteria'});
        }

        const {
            productName,
            prodDesc,
            amount,
            totalAmount,
            taxAmount
        } = getPaymentData(workspace, bookingDetails, chargeDetail);

        const bookingReference = await generateUniqueBookingReference();

        if (workspace.workspace_type === WorkspaceType.ONE_DAY) {

        }

        let newBooking;
        if(workspace.workspace_type === WorkspaceType.ONE_DAY){
            newBooking = await prisma.booking.create({
                data: {
                    workspace_id: checkoutData.workspace.id,
                    user_id: userId,
                    start_date: new Date(checkoutData.bookingDetail.dateSelected.start),
                    no_of_space: checkoutData.bookingDetail.peopleCount,
                    totalAmount: amount,
                    taxAmount: taxAmount,
                    grandTotal: totalAmount,
                    bookingReference,
                    status: 'PENDING',
                }
            });
        } else {
            newBooking = await prisma.booking.create({
                data: {
                    workspace_id: checkoutData.workspace.id,
                    user_id: userId,
                    start_date: new Date(checkoutData.bookingDetail.dateSelected.start),
                    end_date: new Date(checkoutData.bookingDetail.dateSelected.end),
                    no_of_space: checkoutData.bookingDetail.peopleCount,
                    totalAmount: amount,
                    taxAmount: taxAmount,
                    grandTotal: totalAmount,
                    bookingReference,
                    status: 'PENDING',
                }
            });
        }



        console.log("Booking Reference is = {}", bookingReference);

        const session = await createCheckoutSession(
            productName,
            prodDesc,
            totalAmount,
            LOCAL_URL,
            workspaceDetails.id,
            newBooking.bookingReference,
            email
        );

        return session.url
            ? res.status(200).json({success: true, data: {url: session.url}})
            : res.status(500).json({error: 'Failed to create Stripe session'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server error'});
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
    return {productName, prodDesc, amount, totalAmount, taxAmount};
}

function calculateDaysDifference(startDate: Date, endDate: Date, workspaceType: WorkspaceType): number {
    if (workspaceType === WorkspaceType.ONE_DAY) {
        return 1;
    } else {
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 because it's inclusive of both start and end days
    }
}


async function createCheckoutSession(
    productName: string,
    prodDesc: string,
    totalAmount: number,
    localUrl: string,
    id: number,
    bookingReference: string,
    email: string
) {

    const domain = localUrl != '' ? localUrl : DOMAIN_URL;

    const successUrl = `${domain}/checkout?result=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${domain}/checkout?result=cancel&workspaceId=${id}`;

    console.log(`Success url is : ${successUrl} and Cancel url is : ${cancelUrl}`);

    return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [{
            price_data: {
                currency: 'cad',
                product_data: {name: productName, description: prodDesc},
                unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {bookingReference},
        customer_email: email
    });
}

function checkAvailability(workspace: WorkSpaceWithOnlyBookings, startDate: string, endDate: string, noOfPeople: number, workspaceType: WorkspaceType): boolean {
    let bookedSpaces = spacesBooked(workspace.bookings, (booking: Booking) => {
        const bookingStart = new Date(booking.start_date);
        const requestedStart = new Date(startDate);

        if (workspaceType === WorkspaceType.ONE_DAY) {
            return requestedStart.toDateString() === bookingStart.toDateString();
        } else {
            const bookingEnd = booking.end_date ? new Date(booking.end_date) : bookingStart;
            const requestedEnd = new Date(endDate);
            return bookingStart < requestedEnd && bookingEnd > requestedStart;
        }
    });

    const availableSpaces = workspace.no_of_spaces - bookedSpaces;
    return availableSpaces >= noOfPeople;
}

export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        if (session.payment_status === 'paid' && session.metadata?.bookingReference) {
            const bookingReference = session.metadata.bookingReference;

            const workspaceInclude = {
                workspacePhotos: true,
                reviews: true,
                workspaceAmenities: true,
                workspaceAddress: true,
                location: true,
            };

            // Update the booking status in the database
            await prisma.booking.update({
                where: {bookingReference: bookingReference},
                data: {
                    status: BookingStatus.CONFIRMED,
                    stripeSessionId: session.id
                }
            });

            console.log("Booking confirmed")
            const {modifiedResponse, paymentDetails} = await getBookingDetailsByReference(bookingReference, session);
            console.log("Returning response")

            return res.json({
                success: true,
                data: {
                    bookingReference: bookingReference,
                    bookingData: modifiedResponse,
                    paymentData: paymentDetails
                }
            })
        } else {
            res.status(400).json({error: 'Payment not successful or booking reference not found'});
        }
    } catch (error) {
        console.error("Error in confirmBooking:", error);
        return res.status(500).json({error: 'Internal server error'});
    }
}

async function getBookingDetailsByReference(bookingReference: string, session: Stripe.Response<any> | null){

    const updatedBooking: BookingDetails = await prisma.booking.findUnique({
        where: {bookingReference: bookingReference},
        include: {
            user: {
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    mobile: true
                }
            },
            workspace: {
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
            }
        }
    });

    console.log("Booking Retrieved")

    if(session == null && updatedBooking?.stripeSessionId != null) {
        session = await stripe.checkout.sessions.retrieve(updatedBooking.stripeSessionId);
    }


    if (updatedBooking == null) {
        throw Error('Unexpected error happened');
    }

    let paymentDetails = null;
    if (session?.payment_intent) {

        const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string, {
                expand: ['payment_method'],
            }
        );

        console.log("Payment retrieved")

        console.log(paymentIntent);

        if (paymentIntent != null) {
            const paymentMethod: Stripe.PaymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod;

            if (paymentMethod && paymentMethod.card) {
                const maskedCardNumber = `************${paymentMethod.card.last4}`;
                paymentDetails = {
                    billing_details: paymentMethod.billing_details,
                    card_details: {
                        type: paymentMethod.card.funding,
                        brand: paymentMethod.card.brand,
                        card_number: maskedCardNumber,
                    },
                };
            }
        }

    }

    const modifiedWorkspace = getWorkspaceWithDetails(updatedBooking.workspace);

    const modifiedResponse: any = {
        ...updatedBooking,
        workspace: modifiedWorkspace,
        stripeSessionId: undefined
    };

    return { modifiedResponse, paymentDetails };
}



export const getUserBookings = async (req: any, res: Response) => {
    try {
        const userId = req.user.user_id;
        const currentDate = new Date();

        const bookings = await prisma.booking.findMany({
            where: { user_id: userId },
            include: {
                workspace: true,
            }
        });

        const upcomingBookings = bookings.filter((booking: Booking) =>
            new Date(booking.start_date) >= currentDate
        ).map(booking => ({
            bookingReference: booking.bookingReference,
            startDate: booking.start_date,
            endDate: booking.end_date,
            numberOfSpaces: booking.no_of_space,
            workspaceType: booking.workspace.workspace_type,
            status: booking.status
        }));

        const pastBookings = bookings.filter((booking: Booking) =>
            new Date(booking.start_date) < currentDate
        ).map(booking => ({
            bookingReference: booking.bookingReference,
            startDate: booking.start_date,
            endDate: booking.end_date,
            numberOfSpaces: booking.no_of_space,
            workspaceType: booking.workspace.workspace_type,
            status: booking.status
        }));

        return res.json({
            success: true,
            data: {
                upcoming: upcomingBookings,
                past: pastBookings
            }
        });

    } catch (error) {
        console.error("Error in getUserBookings:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserBookingDetails = async (req: any, res: any)=> {
    try {
        const bookingReference = req.params.bookingReference;

        const {modifiedResponse, paymentDetails} = await getBookingDetailsByReference(bookingReference, null);

        return res.json({
            success: true,
            data: {
                bookingReference: bookingReference,
                bookingData: modifiedResponse,
                paymentData: paymentDetails
            }
        });
    }catch (error){
        console.error("Error in getUserBookings:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function generateBookingReference(length = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function generateUniqueBookingReference(length = 6) {
    let unique = false;
    let pnr: string = '';

    try {
        while (!unique) {
            pnr = generateBookingReference(length);
            const existingBooking = await prisma.booking.findUnique({
                where: {bookingReference: pnr}
            });

            if (!existingBooking) {
                unique = true;
            }
        }
        if (!pnr) {
            throw new Error("Error generating booking reference");
        }
        return pnr;
    } catch (error) {
        console.error("Error generating unique booking reference:", error);
        throw new Error("Error generating booking reference");
    }
}
