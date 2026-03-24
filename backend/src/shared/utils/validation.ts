import { EventStatus, UpdateEventBody } from "../../modules/events/event.types";
import { RegisterBody, LoginBody } from "../../modules/auth/auth.types";
import { RsvpBody, RsvpStatus } from "../../modules/invitations/invitation.types";
import { HttpError } from "./httpError";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validRsvpValues = new Set(Object.values(RsvpStatus));
const validEventStatuses = new Set(Object.values(EventStatus));

const isValidDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

export const validateEmail = (email: string): void => {
    if (!emailRegex.test(email)) {
        throw new HttpError(400, "Please provide a valid email address");
    }
};

export const validatePassword = (password: string): void => {
    if (password.length < 6) {
        throw new HttpError(400, "Password must be at least 6 characters long");
    }
};

export const validateRegisterBody = (body: RegisterBody): void => {
    if (!body.fullName?.trim()) {
        throw new HttpError(400, "Full name is required");
    }

    validateEmail(body.email);
    validatePassword(body.password);
};

export const validateLoginBody = (body: LoginBody): void => {
    validateEmail(body.email);

    if (!body.password) {
        throw new HttpError(400, "Password is required");
    }
};

export const validateEventDates = (
    startTime?: string,
    endTime?: string
): void => {
    if (!startTime || !endTime) {
        throw new HttpError(400, "Start time and end time are required");
    }

    if (!isValidDate(startTime) || !isValidDate(endTime)) {
        throw new HttpError(400, "Start time and end time must be valid dates");
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw new HttpError(400, "Event start time must be before end time");
    }
};

export const validateCreateEventBody = (body: {
    title: string;
    startTime: string;
    endTime: string;
}): void => {
    if (!body.title?.trim()) {
        throw new HttpError(400, "Title is required");
    }

    validateEventDates(body.startTime, body.endTime);
};

export const validateUpdateEventBody = (body: UpdateEventBody): void => {
    const hasAnyField = Object.values(body).some(
        (value) => value !== undefined && value !== null
    );

    if (!hasAnyField) {
        throw new HttpError(400, "Provide at least one field to update");
    }

    if (body.title !== undefined && !body.title.trim()) {
        throw new HttpError(400, "Title cannot be empty");
    }

    if ((body.startTime && !body.endTime) || (!body.startTime && body.endTime)) {
        throw new HttpError(
            400,
            "Start time and end time must be updated together"
        );
    }

    if (body.startTime && body.endTime) {
        validateEventDates(body.startTime, body.endTime);
    }

    if (body.status && !validEventStatuses.has(body.status)) {
        throw new HttpError(400, "Invalid event status value");
    }
};

export const validateRsvpBody = (body: RsvpBody): void => {
    if (!validRsvpValues.has(body.status)) {
        throw new HttpError(400, "Invalid RSVP status value");
    }
};

export const validateInvitationBody = (body: { userId: number }): void => {
    if (!Number.isInteger(body.userId) || body.userId <= 0) {
        throw new HttpError(400, "A valid userId is required");
    }
};
