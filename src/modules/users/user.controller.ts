import { Request, Response, NextFunction } from "express";
import { fetchAllUsers, fetchUserById } from "./user.service";

export const getAllUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users = await fetchAllUsers();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        const user = await fetchUserById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};