import express, {Router} from "express";
import authRouter from "./Auth/authRouter";
import workspaceRouter from "./Workspace/workspaceRouter";
import userRouter from "./User/userRouter";



const router: Router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/', workspaceRouter)

export default router;
