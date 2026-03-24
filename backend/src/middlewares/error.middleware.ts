import { Request, Response, NextFunction } from "express";
import { HttpError } from "../shared/utils/httpError";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode =
        error instanceof HttpError
            ? error.statusCode
            : ((error as Error & { statusCode?: number }).statusCode ?? 500);

    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error"
    });
};
