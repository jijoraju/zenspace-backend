import {Request, Response} from "express";
import {Location, PrismaClient} from "@prisma/client";
import {UserWithType} from "../types/types";

const prisma: PrismaClient = new PrismaClient();

export const getUserProfile = async (req: any, res: Response) => {
    console.log("Getting the user profile");
    try{
        if (!req.user) {
            return res.status(401).json({error: 'User not authenticated'});
        }
        const user_id = req.user.user_id;

        const user: UserWithType | null = await prisma.user.findUnique({
            where: {user_id},
            include: {
                userType: true
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid User"
            });
        }

        const payload = {
            user_id: user.user_id,
            email: user.email,
            firstname: user.first_name,
            lastname: user.last_name,
            role: user.userType.type_description
        };

        return res.status(200).json({data : payload});
    }catch (err){
        console.error("Error getting profile details:", err);
        return res.status(500).json({message : "Internal Server error"});
    }
}