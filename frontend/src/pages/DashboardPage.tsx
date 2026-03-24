import { FormEvent, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiMapPin, FiPlusCircle, FiSend } from "react-icons/fi";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";
import { Event, Invitation, User } from "../types";

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
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [eventForm, setEventForm] = useState<CreateEventFormState>(initialEventForm);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load dashboard data once the user reaches this page.
  useEffect(() => {
    const loadData = async () => {
      try {
        const [publicEvents, organizedEvents, myInvitations, allUsers] = await Promise.all([
          api.getEvents(),
          api.getMyOrganizedEvents(),
          api.getMyInvitations(),
          api.getUsers()
        ]);

        setEvents(publicEvents);
        setMyEvents(organizedEvents);
        setInvitations(myInvitations);
        setUsers(allUsers);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      }
    };

    void loadData();
  }, []);

  const inviteCandidates = useMemo(
    () => users.filter((user) => !invitations.some((inv) => inv.user_id === user.id)),
    [users, invitations]
  );

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
      setMyEvents((prev) => [created, ...prev]);
      setEventForm(initialEventForm);
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedEventId || !selectedUserId) {
      setError("Select an event and a user to invite.");
      return;
    }

    try {
      setError(null);
      await api.inviteUser(selectedEventId, selectedUserId);
      setSelectedUserId("");
    } catch (inviteError) {
      setError(toErrorMessage(inviteError));
    }
  };

  const handleRsvp = async (invitationId: number, status: Invitation["rsvp_status"]) => {
    try {
      setError(null);
      const updated = await api.updateRsvp(invitationId, status);
      setInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? { ...inv, ...updated } : inv)));
    } catch (rsvpError) {
      setError(toErrorMessage(rsvpError));
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
        <h2 className="mb-3 text-lg font-semibold">My Invitations ({invitations.length})</h2>
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <article key={invitation.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-medium">{invitation.event_title}</p>
              <p className="text-xs text-slate-500">Current RSVP: {invitation.rsvp_status}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRsvp(invitation.id, "accepted")}
                  className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvp(invitation.id, "declined")}
                  className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvp(invitation.id, "maybe")}
                  className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                >
                  Maybe
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Invite users</h2>
        <form className="space-y-3" onSubmit={handleInvite}>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(Number(event.target.value) || "")}
          >
            <option value="">Select my event</option>
            {myEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(Number(event.target.value) || "")}
          >
            <option value="">Select user</option>
            {inviteCandidates.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>

          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-white">
            <FiSend /> Send invitation
          </button>
        </form>
      </section>

      {error ? <p className="lg:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
};
