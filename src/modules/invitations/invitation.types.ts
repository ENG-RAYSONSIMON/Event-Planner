export enum RsvpStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    MAYBE = "maybe"
}

export interface Invitation {
    id: number;
    event_id: number;
    user_id: number;
    invited_by: number;
    rsvp_status: RsvpStatus;
    responded_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateInvitationBody {
    userId: number;
}

export interface RsvpBody {
    status: RsvpStatus;
}

export interface InvitationParams {
    invitationId: string;
}

export interface EventInvitationParams {
    eventId: string;
}