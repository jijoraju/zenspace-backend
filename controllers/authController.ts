import {PrismaClient} from "@prisma/client";
import {User, UserType} from "@prisma/client";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {RegisterRequest, LoginRequest, LoginResponse} from "../types/types";
import {Request, Response} from 'express';
import {ApiResponse} from '../utils/ApiResponse'

const compare: typeof bcryptjs.compare = bcryptjs.compare;
const genSalt: typeof bcryptjs.genSalt = bcryptjs.genSalt;
const hash: typeof bcryptjs.hash = bcryptjs.hash;


const prisma: PrismaClient = new PrismaClient();

export const register = async (req: Request<unknown, unknown, RegisterRequest>, res: Response) => {

    const data: RegisterRequest = req.body;

    // Generate salt and hash the password
    const salt: string = await genSalt(10);
    const hashedPassword: string = await hash(data.password, salt);

    try {

        // Fetch the user_type_id for 'user' type
        const userType: UserType | null = await prisma.userType.findFirst({
            where: {type_description: 'user'}
        });

        // Check if user type exists
        if (!userType) {
            return ApiResponse.error(res, "User type not found.");
        }

        // Create the user
        await prisma.user.create({
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: hashedPassword,
                user_type_id: userType.type_id
            }
        });

        return ApiResponse.ok(res);
    } catch (error) {
        return ApiResponse.errorWithStatus(res,500, 'Server error');
    }
}

export const login = async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
    const {email, password} = req.body;

    const user: User | null = await prisma.user.findUnique({where: {email}});

    if (!user) {
        return ApiResponse.errorWithStatus(res,401, 'Invalid credentials');
    }

    const isMatch: boolean = await compare(password, user.password);
    if (!isMatch) {
        return ApiResponse.errorWithStatus(res,401, 'Invalid credentials');
    }

    const payload: LoginResponse = {user_id: user.user_id, email: user.email};

    // Ensure that JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined!');
    }
    const JWT_SECRET: string = process.env.JWT_SECRET;

    const token: string = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

    res.json({success: true, token});
};


export const logout = (req: Request, res: Response) => {
    return ApiResponse.ok(res, {message: 'Logged out successfully'});
};