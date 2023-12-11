import express, {Request, Response, Router} from "express";
import authRouter from "./Auth/authRouter";
import workspaceRouter from "./Workspace/workspaceRouter";
import userRouter from "./User/userRouter";



const router: Router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/', workspaceRouter)
router.use('/health', (_req: Request, res: Response) => {
    return res.status(200).json({
        message: "Ok"
    });
})

export default router;
