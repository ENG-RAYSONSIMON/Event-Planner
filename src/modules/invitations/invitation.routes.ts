import { Router } from "express";
import {
    createInvitation,
    updateRsvp,
    getEventInvitations
} from "./invitation.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/events/:eventId/invitations", requireAuth, createInvitation);
router.get("/events/:eventId/invitations", requireAuth, getEventInvitations);
router.patch("/invitations/:invitationId/rsvp", requireAuth, updateRsvp);

export default router;
