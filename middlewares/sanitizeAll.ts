import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        return validator.escape(input);
    } else if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    } else if (typeof input === 'object' && input !== null) {
        const sanitizedObject: { [key: string]: any } = {};
        for (const key in input) {
            sanitizedObject[key] = sanitizeInput(input[key]);
        }
        return sanitizedObject;
    }
    return input;
}

function sanitizeAll(req: Request, res: Response, next: NextFunction) {
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    next();
}

export default sanitizeAll;
