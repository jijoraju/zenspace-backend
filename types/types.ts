import {Prisma} from "@prisma/client";


export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

export interface RegisterRequest {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_id: number;
    email: string;
    role?: string;
    token: string;
}

export type UserWithType = Prisma.UserGetPayload<{
    include: { userType: true }
}>

export type WorkSpaceWithBookings = (Prisma.WorkspaceGetPayload<{
    include: {
        reviews: true,
        workspaceAddress: true,
        location: true,
        bookings: true,
    }
}>);

export type WorkSpaceWithOnlyBookings = (Prisma.WorkspaceGetPayload<{
    include: {
        bookings: true,
    }
}>);

export type WorkspaceFull = (Prisma.WorkspaceGetPayload<{
    include: {
        reviews: true,
        workspaceAddress: true,
        location: true,
        workspaceAmenities: {
            include: {
                amenity: true,
            }
        },
        workspacePhotos: true
    }
}>) | null;

export type WorkspaceDetails = {
    id: number;
    type: 'MULTIPLE_DAYS' | 'ONE_DAY';
};

export type DateSelected = {
    start: string;
    end: string;
};

export type BookingDetail = {
    dateSelected: DateSelected;
    peopleCount: number;
};

export type ChargeDetail = {
    charge: number;
    tax: number;
    Total: number;
};

export type CheckoutRequest = {
    workspace: WorkspaceDetails;
    bookingDetail: BookingDetail;
    chargeDetail: ChargeDetail;
    domain: string;
};
