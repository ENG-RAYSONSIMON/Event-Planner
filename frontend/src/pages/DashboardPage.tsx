import { FormEvent, useEffect, useState } from "react";
import { FiCalendar, FiMapPin, FiPlusCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";
import { Event, Invitation } from "../types";

interface CreateEventFormState {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}

const initialEventForm: CreateEventFormState = {
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: ""
};

export const DashboardPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [eventForm, setEventForm] = useState<CreateEventFormState>(initialEventForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeInvitationId, setActiveInvitationId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [publicEvents, myInvitations] = await Promise.all([api.getEvents(), api.getMyInvitations()]);
        setEvents(publicEvents);
        setInvitations(myInvitations);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      }
    };

    void loadData();
  }, []);

  const handleCreateEvent = async (event: FormEvent) => {
    event.preventDefault();

    if (!eventForm.title || !eventForm.startTime || !eventForm.endTime) {
      setError("Title, start time, and end time are required.");
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      const created = await api.createEvent({
        title: eventForm.title,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        startTime: new Date(eventForm.startTime).toISOString(),
        endTime: new Date(eventForm.endTime).toISOString(),
        status: "published"
      });

      setEvents((prev) => [created, ...prev]);
      setEventForm(initialEventForm);
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRsvp = async (invitationId: number, status: Invitation["rsvp_status"]) => {
    try {
      setError(null);
      setActiveInvitationId(invitationId);
      const updated = await api.updateRsvp(invitationId, status);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? {
                ...inv,
                rsvp_status: updated.status
              }
            : inv
        )
      );
    } catch (rsvpError) {
      setError(toErrorMessage(rsvpError));
    } finally {
      setActiveInvitationId(null);
    }
  };

  return (
    <main className="grid gap-4 pb-8 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm lg:col-span-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FiPlusCircle /> Create event
        </h2>

        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreateEvent}>
          <input
            placeholder="Event title"
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={eventForm.title}
            onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            placeholder="Location"
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={eventForm.location}
            onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <input
            type="datetime-local"
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={eventForm.startTime}
            onChange={(event) => setEventForm((prev) => ({ ...prev, startTime: event.target.value }))}
          />
          <input
            type="datetime-local"
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={eventForm.endTime}
            onChange={(event) => setEventForm((prev) => ({ ...prev, endTime: event.target.value }))}
          />
          <textarea
            placeholder="Description"
            className="rounded-xl border border-slate-300 px-3 py-2 sm:col-span-2"
            value={eventForm.description}
            onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-brand-600 px-3 py-2 font-medium text-white sm:col-span-2"
          >
            {isSaving ? "Saving..." : "Create event"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <FiCalendar /> Public Events ({events.length})
        </h2>
        <div className="space-y-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-slate-500">{new Date(event.start_time).toLocaleString()}</p>
              {event.location ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <FiMapPin /> {event.location}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">My Invitations ({invitations.length})</h2>
          <Link to="/events/my" className="text-sm font-medium text-brand-700">
            Manage my events
          </Link>
        </div>
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <article key={invitation.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-medium">{invitation.event_title}</p>
              <p className="text-xs text-slate-500">Current RSVP: {invitation.rsvp_status}</p>
              <div className="mt-2 flex gap-2">
                {(["accepted", "declined", "maybe"] as Invitation["rsvp_status"][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={activeInvitationId === invitation.id}
                    onClick={() => handleRsvp(invitation.id, status)}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {error ? <p className="lg:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
};
