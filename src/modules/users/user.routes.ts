import { Router } from "express";
import { getAllUsers, getUserById } from "./user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;