import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { JwtPayload } from "../../modules/auth/auth.types";

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
};