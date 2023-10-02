import {Prisma} from "@prisma/client";


export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
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
    token: string;
}

export type UserWithType = Prisma.UserGetPayload<{
    include: { userType: true }
}>