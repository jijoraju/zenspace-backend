import express, {Router} from "express";
import {login, logout, register} from "../controllers/authController";
import passport from "passport";
import {checkUserRole} from "../middlewares/authorization";

const router: Router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected route example
router.get('/admin', passport.authenticate('jwt', {session: false}), checkUserRole('admin'), (req, res) => {
    res.json({message: 'Admin area!'});
});

export default router;
