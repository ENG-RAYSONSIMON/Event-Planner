import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "./auth.service";
import { RegisterBody, LoginBody } from "./auth.types";
import {
    validateLoginBody,
    validateRegisterBody
} from "../../shared/utils/validation";

export const register = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        validateRegisterBody(req.body);
        const user = await registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        validateLoginBody(req.body);
        const result = await loginUser(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
