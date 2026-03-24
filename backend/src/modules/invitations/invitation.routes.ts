import { Router } from "express";
import {
    createInvitation,
    updateRsvp,
    getEventInvitations,
    getMyInvitations
} from "./invitation.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/invitations/me", requireAuth, getMyInvitations);
router.post("/events/:eventId/invitations", requireAuth, createInvitation);
router.get("/events/:eventId/invitations", requireAuth, getEventInvitations);
router.patch("/invitations/:invitationId/rsvp", requireAuth, updateRsvp);

export default router;
