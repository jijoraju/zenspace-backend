import {Request, Response} from "express";
import {$Enums, Booking, PrismaClient} from "@prisma/client";
import WorkspaceType = $Enums.WorkspaceType;
import {WorkSpaceWithBookings} from "../types/types";

const prisma: PrismaClient = new PrismaClient();


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
                    if(fromDate) {
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
            take : pageSize,
            orderBy: {
                [sort || 'name'] : order
            }
        });

        const modifiedResponse: Omit<WorkSpaceWithBookings, 'bookings'>[] = searchResults.map(({ bookings, ...otherProps }) => otherProps);

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

