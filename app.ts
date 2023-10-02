import express, {Express} from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import passport from "./config/passport";
import swaggerJSDoc from "swagger-jsdoc";
import {options} from "./config/swagger";
import router from "./routes";

const __dirname: string = dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/api', router);  // All routes will now be under /api

const specs = swaggerJSDoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);

export default app;
