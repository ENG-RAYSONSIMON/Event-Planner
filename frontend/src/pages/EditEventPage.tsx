import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";
import { Event } from "../types";

interface EventFormState {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  status: Event["status"];
}

const toLocalDateTimeValue = (input: string) => {
  const date = new Date(input);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<EventFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const id = Number(eventId);
    if (!id) {
      setError("Invalid event id.");
      return;
    }

    const loadEvent = async () => {
      try {
        setError(null);
        const event = await api.getEventById(id);
        setFormState({
          title: event.title,
          description: event.description ?? "",
          location: event.location ?? "",
          startTime: toLocalDateTimeValue(event.start_time),
          endTime: toLocalDateTimeValue(event.end_time),
          status: event.status
        });
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      }
    };

    void loadEvent();
  }, [eventId]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!formState || !eventId) {
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      await api.updateEvent(Number(eventId), {
        title: formState.title,
        description: formState.description || undefined,
        location: formState.location || undefined,
        startTime: new Date(formState.startTime).toISOString(),
        endTime: new Date(formState.endTime).toISOString(),
        status: formState.status
      });
      navigate("/events/my");
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) {
      return;
    }

    try {
      setError(null);
      setIsDeleting(true);
      await api.deleteEvent(Number(eventId));
      navigate("/events/my");
    } catch (deleteError) {
      setError(toErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!formState) {
    return <p className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">Loading event details...</p>;
  }

  return (
    <main className="mx-auto w-full max-w-2xl pb-8">
      <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Edit event</h2>

        <form className="space-y-3" onSubmit={handleSave}>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={formState.title}
            onChange={(event) => setFormState((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
            placeholder="Event title"
          />
          <textarea
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={formState.description}
            onChange={(event) => setFormState((prev) => (prev ? { ...prev, description: event.target.value } : prev))}
            placeholder="Description"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={formState.location}
            onChange={(event) => setFormState((prev) => (prev ? { ...prev, location: event.target.value } : prev))}
            placeholder="Location"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={formState.startTime}
              onChange={(event) => setFormState((prev) => (prev ? { ...prev, startTime: event.target.value } : prev))}
            />
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={formState.endTime}
              onChange={(event) => setFormState((prev) => (prev ? { ...prev, endTime: event.target.value } : prev))}
            />
          </div>

          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={formState.status}
            onChange={(event) =>
              setFormState((prev) =>
                prev ? { ...prev, status: event.target.value as Event["status"] } : prev
              )
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="rounded-xl bg-brand-600 px-4 py-2 text-white">
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-xl bg-red-600 px-4 py-2 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete event"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
};
