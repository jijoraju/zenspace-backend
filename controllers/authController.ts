import {PrismaClient} from "@prisma/client";
import {User, UserType} from "@prisma/client";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {RegisterRequest, LoginRequest, LoginResponse, ApiResponse} from "../types/types";
import {Request, Response} from 'express';

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
            return res.status(500).json({
                message: "User type not found."
            });
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
        res.status(200);
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const login = async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
    const {email, password} = req.body;

    const user: User | null = await prisma.user.findUnique({where: {email}});

    if (!user) {
        const error: ApiResponse<void> = {
            success: false,
            message: "Invalid credentials"
        }
        return res.status(401).json(error);
    }

    const isMatch: boolean = await compare(password, user.password);
    if (!isMatch) {
        const error: ApiResponse<void> = {
            success: false,
            message: "Invalid credentials"
        }
        res.status(401).json(error);
    }

    const payload = {user_id: user.user_id, email: user.email};

    // Ensure that JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined!');
    }
    const JWT_SECRET: string = process.env.JWT_SECRET;

    const token: string = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

    const success: ApiResponse<LoginResponse> = {
        success: false,
        data: {...payload, token}
    }
    res.json(success);
};


export const logout = (req: Request, res: Response) => {
    const success: ApiResponse<LoginResponse> = {
        success: false,
        message: "Logged out successfully"
    }
    res.json(success);
};