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

interface MyInvitationRow extends InvitationRow {
    event_title: string;
    event_description: string | null;
    event_location: string | null;
    event_start_time: Date;
    event_end_time: Date;
    event_status: string;
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

export const getMyInvitationsService = async (
    userId: number
): Promise<MyInvitationRow[]> => {
    const [invitations] = await db.query<MyInvitationRow[]>(
        `SELECT
            i.*,
            e.title AS event_title,
            e.description AS event_description,
            e.location AS event_location,
            e.start_time AS event_start_time,
            e.end_time AS event_end_time,
            e.status AS event_status
        FROM invitations i
        INNER JOIN events e ON e.id = i.event_id
        WHERE i.user_id = ?
        ORDER BY i.id DESC`,
        [userId]
    );

    return invitations;
};
