import { db } from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateInvitationBody, RsvpBody } from "./invitation.types";
import { HttpError } from "../../shared/utils/httpError";

interface InvitationRow extends RowDataPacket {
    id: number;
    event_id: number;
    user_id: number;
    invited_by: number;
    rsvp_status: string;
    responded_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

interface EventInvitationRow extends InvitationRow {
    invited_user_name: string;
    invited_user_email: string;
}

export const createInvitationService = async (
    eventId: number,
    body: CreateInvitationBody,
    invitedBy: number
) => {
    const [existingInvitations] = await db.query<InvitationRow[]>(
        "SELECT id FROM invitations WHERE event_id = ? AND user_id = ?",
        [eventId, body.userId]
    );

    if (existingInvitations.length > 0) {
        throw new HttpError(409, "User has already been invited to this event");
    }

    const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO invitations (event_id, user_id, invited_by)
     VALUES (?, ?, ?)`,
        [eventId, body.userId, invitedBy]
    );

    return {
        id: result.insertId,
        eventId,
        userId: body.userId,
        invitedBy,
        status: "pending"
    };
};

export const updateRsvpService = async (
    invitationId: number,
    body: RsvpBody
) => {
    await db.execute(
        `UPDATE invitations
     SET rsvp_status = ?, responded_at = NOW()
     WHERE id = ?`,
        [body.status, invitationId]
    );

    return {
        invitationId,
        status: body.status
    };
};

export const getInvitationByIdService = async (
    invitationId: number
): Promise<InvitationRow | null> => {
    const [invitations] = await db.query<InvitationRow[]>(
        "SELECT * FROM invitations WHERE id = ?",
        [invitationId]
    );

    return invitations[0] || null;
};

export const getEventInvitationsService = async (
    eventId: number
): Promise<EventInvitationRow[]> => {
    const [invitations] = await db.query<EventInvitationRow[]>(
        `SELECT i.*, u.full_name AS invited_user_name, u.email AS invited_user_email
         FROM invitations i
         INNER JOIN users u ON u.id = i.user_id
         WHERE i.event_id = ?
         ORDER BY i.id DESC`,
        [eventId]
    );

    return invitations;
};
