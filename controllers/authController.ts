import {PrismaClient} from "@prisma/client";
import {User, UserType} from "@prisma/client";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {RegisterRequest, LoginRequest, UserWithType} from "../types/types";
import {Request, Response} from 'express';

const compare: typeof bcryptjs.compare = bcryptjs.compare;
const genSalt: typeof bcryptjs.genSalt = bcryptjs.genSalt;
const hash: typeof bcryptjs.hash = bcryptjs.hash;


const prisma: PrismaClient = new PrismaClient();

export const register = async (req: Request<unknown, unknown, RegisterRequest>, res: Response) => {
    const data: RegisterRequest = req.body;

    console.log(data);

    try {
        // Generate salt and hash the password
        const salt: string = await genSalt(10);
        const hashedPassword: string = await hash(data.password, salt);

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
                first_name: data.firstname,
                last_name: data.lastname,
                email: data.email,
                password: hashedPassword,
                user_type_id: userType.type_id
            }
        });

        // Return a success response
        return res.status(200).json({message: 'User registered successfully'});

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


export const login = async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
    const {email, password} = req.body;

    const user: UserWithType | null = await prisma.user.findUnique({
        where: {email},
        include: {
            userType: true
        }
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const isMatch: boolean = await compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const payload = {user_id: user.user_id, email: user.email, role: user.userType.type_description};

    // Ensure that JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined!');
    }
    const JWT_SECRET: string = process.env.JWT_SECRET;

    const token: string = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

    return res.status(200).json({
        data: {...payload, token}
    });
};


export const logout = (_req: Request, res: Response) => {
    return res.status(200).json({
        message: "Logged out successfully"
    });
};