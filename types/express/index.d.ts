import {UserWithType} from "../types";

declare global {
    namespace Express {
        interface Request {
            user?: UserWithType;
        }
    }
}