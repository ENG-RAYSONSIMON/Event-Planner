import { Request, Response, NextFunction } from "express";
import {
    createEventService,
    getAllEventsService,
    getEventByIdService,
    updateEventService,
    deleteEventService,
    ensureEventOrganizer
} from "./event.service";
import { CreateEventBody, UpdateEventBody } from "./event.types";
import {
    validateCreateEventBody,
    validateUpdateEventBody
} from "../../shared/utils/validation";
import { HttpError } from "../../shared/utils/httpError";

export const createEvent = async (
    req: Request<{}, {}, CreateEventBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        validateCreateEventBody(req.body);

        const organizerId = req.user.userId;

        const event = await createEventService(req.body, organizerId);

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });
    } catch (error) {
        next(error);
    }
};

export const getAllEvents = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const events = await getAllEventsService();

        res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: events
        });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        const event = await getEventByIdService(id);

        if (!event) {
            res.status(404).json({
                success: false,
                message: "Event not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Event fetched successfully",
            data: event
        });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        const eventId = Number(req.params.id);
        const body = req.body as UpdateEventBody;

        validateUpdateEventBody(body);
        await ensureEventOrganizer(eventId, req.user.userId);

        const event = await updateEventService(eventId, body);

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: event
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        const eventId = Number(req.params.id);

        await ensureEventOrganizer(eventId, req.user.userId);
        await deleteEventService(eventId);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
