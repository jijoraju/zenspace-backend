import {Prisma} from "@prisma/client";


export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_id: number;
    email: string;
    role?: string;
}

export type UserWithType = Prisma.UserGetPayload<{
    include: { userType: true }
}>