import { FormEvent, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiMail, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";
import { Event, EventInvitation, User } from "../types";

export const MyEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [eventInvitations, setEventInvitations] = useState<EventInvitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [myEvents, allUsers] = await Promise.all([api.getMyOrganizedEvents(), api.getUsers()]);
        setEvents(myEvents);
        setUsers(allUsers);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      }
    };

    void loadBaseData();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setEventInvitations([]);
      return;
    }

    const loadEventInvitations = async () => {
      try {
        const data = await api.getEventInvitations(selectedEventId);
        setEventInvitations(data);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      }
    };

    void loadEventInvitations();
  }, [selectedEventId]);

  const inviteCandidates = useMemo(() => {
    const invitedUserIds = new Set(eventInvitations.map((invitation) => invitation.user_id));
    return users.filter((user) => !invitedUserIds.has(user.id));
  }, [eventInvitations, users]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedEventId || !selectedUserId) {
      setError("Select an event and a user to invite.");
      return;
    }

    try {
      setError(null);
      setIsInviting(true);
      await api.inviteUser(selectedEventId, selectedUserId);
      const refreshed = await api.getEventInvitations(selectedEventId);
      setEventInvitations(refreshed);
      setSelectedUserId("");
    } catch (inviteError) {
      setError(toErrorMessage(inviteError));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <main className="grid gap-4 pb-8 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <FiUsers /> My Organized Events ({events.length})
        </h2>

        <div className="space-y-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-slate-500">{new Date(event.start_time).toLocaleString()}</p>
                </div>
                <Link
                  to={`/events/${event.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  <FiEdit2 /> Edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <FiMail /> Invite Users
        </h2>

        <form className="space-y-3" onSubmit={handleInvite}>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(Number(event.target.value) || "")}
          >
            <option value="">Select my event</option>
            {events.map((event) => (
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

          <button type="submit" disabled={isInviting} className="rounded-xl bg-slate-800 px-3 py-2 text-white">
            {isInviting ? "Sending..." : "Send invitation"}
          </button>
        </form>

        {selectedEventId ? (
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700">Existing invitations</h3>
            {eventInvitations.length === 0 ? (
              <p className="text-sm text-slate-500">No invitations yet.</p>
            ) : (
              eventInvitations.map((invitation) => (
                <article key={invitation.id} className="rounded-xl border border-slate-200 p-2 text-sm">
                  <p>{invitation.invited_user_name}</p>
                  <p className="text-xs text-slate-500">{invitation.invited_user_email}</p>
                  <p className="mt-1 text-xs">RSVP: {invitation.rsvp_status}</p>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>

      {error ? <p className="lg:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
};
