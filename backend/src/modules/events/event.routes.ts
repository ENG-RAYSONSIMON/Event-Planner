import { Router } from "express";
import {
    createEvent,
    getAllEvents,
    getMyOrganizedEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "./event.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", requireAuth, createEvent);
router.get("/me/organized", requireAuth, getMyOrganizedEvents);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.patch("/:id", requireAuth, updateEvent);
router.delete("/:id", requireAuth, deleteEvent);

export default router;
