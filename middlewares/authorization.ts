import { Request, Response, NextFunction } from "express";
import {UserWithType} from "../types/types";

export const checkUserRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user : UserWithType | undefined = req.user as UserWithType | undefined;
        if (user && user.userType.type_description == role) {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Access denied' });
        }
    };
};
