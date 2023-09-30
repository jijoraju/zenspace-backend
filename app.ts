import express, {Express} from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './dist/swagger.json' assert { type: 'json' };


import routes from "./routes/index";
import passport from "./config/passport";

const __dirname: string = dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
RegisterRoutes(app);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


export default app;
