import express, {Express} from 'express';
import path, {dirname} from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import {fileURLToPath} from 'url';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import passport from "./config/passport";
import swaggerJSDoc from "swagger-jsdoc";
import {options} from "./config/swagger";
import router from "./routes";
import sanitizeAll from "./middlewares/sanitizeAll";

const allowedOrigins: string[] = [
    'http://localhost:5173',
    "http://127.0.0.1:5173",
    'https://zenspace-frontend.onrender.com',
    'https://zenspace-backend.onrender.com',
    'http://192.168.1.100:8888',
    'http://192.168.1.100:8889',
    'http://localhost:4000',
    'https://checkout.stripe.com'];

const corsOptions: cors.CorsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization']
};

const __dirname: string = dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use(sanitizeAll);
app.use(passport.initialize());

app.use('/api', router);  // All routes will now be under /api

const specs = swaggerJSDoc(options);

const customSwaggerOptions = {
    explorer: true,
    swaggerOptions: {
        authAction: {
            JWT: {
                name: 'JWT',
                schema: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'Bearer'
                },
                value: 'Bearer <my own JWT token>'
            }
        }
    }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, customSwaggerOptions));

export default app;
