import { Request, Response, NextFunction } from "express";
import {
    createInvitationService,
    updateRsvpService,
    getEventInvitationsService,
    getInvitationByIdService
} from "./invitation.service";
import { CreateInvitationBody, RsvpBody } from "./invitation.types";
import {
    validateInvitationBody,
    validateRsvpBody
} from "../../shared/utils/validation";
import { HttpError } from "../../shared/utils/httpError";
import { ensureEventOrganizer } from "../events/event.service";

export const createInvitation = async (
    req: Request<{ eventId: string }, {}, CreateInvitationBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const eventId = Number(req.params.eventId);
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        validateInvitationBody(req.body);
        await ensureEventOrganizer(eventId, req.user.userId);

        const invitedBy = req.user.userId;

        const invitation = await createInvitationService(eventId, req.body, invitedBy);

        res.status(201).json({
            success: true,
            message: "Invitation created successfully",
            data: invitation
        });
    } catch (error) {
        next(error);
    }
};

export const updateRsvp = async (
    req: Request<{ invitationId: string }, {}, RsvpBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        const invitationId = Number(req.params.invitationId);
        validateRsvpBody(req.body);

        const invitation = await getInvitationByIdService(invitationId);

        if (!invitation) {
            throw new HttpError(404, "Invitation not found");
        }

        if (invitation.user_id !== req.user.userId) {
            throw new HttpError(403, "You can only update your own RSVP");
        }

        const result = await updateRsvpService(invitationId, req.body);

        res.status(200).json({
            success: true,
            message: "RSVP updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getEventInvitations = async (
    req: Request<{ eventId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        const eventId = Number(req.params.eventId);

        await ensureEventOrganizer(eventId, req.user.userId);

        const invitations = await getEventInvitationsService(eventId);

        res.status(200).json({
            success: true,
            message: "Invitations fetched successfully",
            data: invitations
        });
    } catch (error) {
        next(error);
    }
};
