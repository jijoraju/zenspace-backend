import {Response} from "express";

export class ApiResponse {
    static ok<T>(res: Response, data?: T) {
        res.status(200).json({
            success: true,
            data: data
        });
    }

    static successWithStatus<T>(res: Response, status: number, data: T) {
        res.status(status).json({
            success: true,
            data: data
        });
    }

    static error(res: Response, message: string) {
        res.status(400).json({
            success: false,
            message: message,
        });
    }

    static errorWithStatus(res: Response, status: number, message: string) {
        res.status(status).json({
            success: false,
            message: message,
        });
    }
}