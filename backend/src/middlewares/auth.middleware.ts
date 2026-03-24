import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../shared/utils/jwt";
import { HttpError } from "../shared/utils/httpError";

export const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization token is required");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new HttpError(401, "Authorization token is required");
        }

        req.user = verifyToken(token);
        next();
    } catch (_error) {
        next(new HttpError(401, "Invalid or expired authorization token"));
    }
};
