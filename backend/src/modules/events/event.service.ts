import { db } from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateEventBody } from "./event.types";
import { EventStatus, UpdateEventBody } from "./event.types";
import { HttpError } from "../../shared/utils/httpError";

interface EventRow extends RowDataPacket {
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

    const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO events
    (title, description, location, start_time, end_time, organizer_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || null, location || null, startTime, endTime, organizerId]
    );

    return {
        id: result.insertId,
        title,
        description: description || null,
        location: location || null,
        startTime,
        endTime,
        organizerId
    };
};

export const getAllEventsService = async () => {
    const [events] = await db.query<EventRow[]>(
        "SELECT * FROM events ORDER BY id DESC"
    );

    return events;
};

export const getMyOrganizedEventsService = async (organizerId: number) => {
    const [events] = await db.query<EventRow[]>(
        "SELECT * FROM events WHERE organizer_id = ? ORDER BY id DESC",
        [organizerId]
    );

    return events;
};

export const getEventByIdService = async (id: number) => {
    const [events] = await db.query<EventRow[]>(
        "SELECT * FROM events WHERE id = ?",
        [id]
    );

    return events[0] || null;
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

    await db.execute(
        `UPDATE events
         SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?, status = ?
         WHERE id = ?`,
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
    const [result] = await db.execute<ResultSetHeader>(
        "DELETE FROM events WHERE id = ?",
        [eventId]
    );

    if (result.affectedRows === 0) {
        throw new HttpError(404, "Event not found");
    }
};
