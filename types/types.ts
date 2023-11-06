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

export type WorkSpaceWithBookings = Prisma.WorkspaceGetPayload<{
    include: {
        reviews: true,
        workspaceAddress: true,
        location: true,
        bookings: true,
    }
}>

export type WorkspaceFull = (Prisma.WorkspaceGetPayload<{
    include: {
        reviews: true,
        workspaceAddress: true,
        location: true,
        workspaceAmenities: true,
        workspacePhotos: true
    }
}>) | null;