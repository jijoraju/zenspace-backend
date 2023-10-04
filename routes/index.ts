import express, {Router} from "express";
import authRouter from "./Auth/authRouter";
import workspaceRouter from "./Workspace/workspaceRouter";



const router: Router = express.Router();

router.use('/auth', authRouter);
router.use('/', workspaceRouter)

export default router;
