import { db } from "../../config/db";
import { CreateEventBody } from "./event.types";
import { EventStatus, UpdateEventBody } from "./event.types";
import { HttpError } from "../../shared/utils/httpError";

interface EventRow {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    start_time: Date;
    end_time: Date;
    status: EventStatus;
    organizer_id: number;
    created_at: Date;
    updated_at: Date;
}

export const createEventService = async (
    body: CreateEventBody,
    organizerId: number
) => {
    const { title, description, location, startTime, endTime } = body;

    const result = await db.query<{ id: number }>(
        `INSERT INTO events
    (title, description, location, start_time, end_time, organizer_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`,
        [title, description || null, location || null, startTime, endTime, organizerId]
    );

    return {
        id: result.rows[0].id,
        title,
        description: description || null,
        location: location || null,
        startTime,
        endTime,
        organizerId
    };
};

export const getAllEventsService = async () => {
    const eventsResult = await db.query<EventRow>(
        "SELECT * FROM events ORDER BY id DESC"
    );

    return eventsResult.rows;
};

export const getMyOrganizedEventsService = async (organizerId: number) => {
    const eventsResult = await db.query<EventRow>(
        "SELECT * FROM events WHERE organizer_id = $1 ORDER BY id DESC",
        [organizerId]
    );

    return eventsResult.rows;
};

export const getEventByIdService = async (id: number) => {
    const eventsResult = await db.query<EventRow>(
        "SELECT * FROM events WHERE id = $1",
        [id]
    );

    return eventsResult.rows[0] || null;
};

export const ensureEventOrganizer = async (
    eventId: number,
    userId: number
): Promise<EventRow> => {
    const event = await getEventByIdService(eventId);

    if (!event) {
        throw new HttpError(404, "Event not found");
    }

    if (event.organizer_id !== userId) {
        throw new HttpError(403, "Only the event organizer can perform this action");
    }

    return event;
};

export const updateEventService = async (
    eventId: number,
    body: UpdateEventBody
) => {
    const currentEvent = await getEventByIdService(eventId);

    if (!currentEvent) {
        throw new HttpError(404, "Event not found");
    }

    const updatedEvent = {
        title: body.title ?? currentEvent.title,
        description:
            body.description !== undefined
                ? body.description || null
                : currentEvent.description,
        location:
            body.location !== undefined
                ? body.location || null
                : currentEvent.location,
        startTime: body.startTime ?? currentEvent.start_time,
        endTime: body.endTime ?? currentEvent.end_time,
        status: body.status ?? currentEvent.status
    };

    await db.query(
        `UPDATE events
         SET title = $1, description = $2, location = $3, start_time = $4, end_time = $5, status = $6
         WHERE id = $7`,
        [
            updatedEvent.title,
            updatedEvent.description,
            updatedEvent.location,
            updatedEvent.startTime,
            updatedEvent.endTime,
            updatedEvent.status,
            eventId
        ]
    );

    return await getEventByIdService(eventId);
};

export const deleteEventService = async (eventId: number): Promise<void> => {
    const result = await db.query(
        "DELETE FROM events WHERE id = $1",
        [eventId]
    );

    if (result.rowCount === 0) {
        throw new HttpError(404, "Event not found");
    }
};
