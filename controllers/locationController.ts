import {Request, Response} from "express";
import {Location, PrismaClient} from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const findAllLocations = async (req: Request, res: Response) => {
    console.log("Getting all the locations");
    try{
        const locations: Location[]  = await prisma.location.findMany();
        console.log("Returning all the locations");

        if (locations.length === 0) {
            return res.status(404).json({ message: "No locations found" });
        }

        return res.status(200).json({data : locations});
    }catch (err){
        console.error("Error getting all the locations:", err);
        return res.status(500).json({message : "Internal Server error"});
    }
}

export const findLocationByName = async (req: Request, res: Response) => {
    console.log("Getting locations by name");

    const name: string | undefined = req.query.name as string;

    if (!name) {
        return res.status(400).json({ message: "Query parameter 'name' is required" });
    }

    try{
        const locations: Location[]  = await prisma.location.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                }
            }
        });
        console.log("Returning locations");

        if (locations.length === 0) {
            return res.status(404).json({ message: "No locations found" });
        }

        return res.status(200).json({data : locations});
    } catch (err){
        console.error("Error getting locations:", err);
        return res.status(500).json({message : "Internal Server error"});
    }
}