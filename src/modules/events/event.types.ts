export enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CANCELLED = "cancelled"
}

export interface Event {
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

export interface CreateEventBody {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
}

export interface UpdateEventBody {
    title?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    status?: EventStatus;
}

export interface EventParams {
    id: string;
}