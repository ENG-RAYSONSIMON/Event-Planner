import { useEffect, useState } from "react";
import { api } from "./api";
import { Event, Invitation } from "./types";

export const App = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myInvitations, setMyInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getEvents().then(setEvents).catch((err: Error) => setError(err.message));

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    api.getMyOrganizedEvents(token).then(setMyEvents).catch(() => undefined);
    api.getMyInvitations(token).then(setMyInvitations).catch(() => undefined);
  }, []);

  return (
    <main>
      <h1>Event Planner</h1>
      <p>This frontend skeleton is ready to consume your API.</p>
      {error ? <p className="error">{error}</p> : null}

      <section>
        <h2>Public Events ({events.length})</h2>
        <ul>
          {events.map((event: Event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>My Organized Events ({myEvents.length})</h2>
        <ul>
          {myEvents.map((event: Event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>My Invitations ({myInvitations.length})</h2>
        <ul>
          {myInvitations.map((invitation: Invitation) => (
            <li key={invitation.id}>
              {invitation.event_title} ({invitation.rsvp_status})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};
