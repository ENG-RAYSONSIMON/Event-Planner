-- Create and connect to the PostgreSQL database first:
--   CREATE DATABASE event_planner;
-- Then run this file while connected to event_planner.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status_enum') THEN
        CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'cancelled');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rsvp_status_enum') THEN
        CREATE TYPE rsvp_status_enum AS ENUM ('pending', 'accepted', 'declined', 'maybe');
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status event_status_enum NOT NULL DEFAULT 'draft',
    organizer_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    invited_by INTEGER NOT NULL,
    rsvp_status rsvp_status_enum NOT NULL DEFAULT 'pending',
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitations_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invitations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invitations_invited_by
        FOREIGN KEY (invited_by) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_event_user UNIQUE (event_id, user_id)
);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS events_set_updated_at ON events;
CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS invitations_set_updated_at ON invitations;
CREATE TRIGGER invitations_set_updated_at
BEFORE UPDATE ON invitations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
