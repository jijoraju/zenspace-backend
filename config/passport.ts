import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt';
import {PrismaClient} from '@prisma/client'
import {JwtPayload} from "jsonwebtoken";
import {UserWithType} from "../types/types";

const prisma: PrismaClient = new PrismaClient();


const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || '',
};

passport.use(
    new JwtStrategy(opts, async (jwtPayload: JwtPayload, done: VerifiedCallback) => {
        try {
            const user: UserWithType | null = await prisma.user.findUnique({
                where: { user_id: jwtPayload.user_id },
                include: {
                    userType: true
                }
            });
            if (user) return done(null, user);
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport;
