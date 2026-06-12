"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import EventForm from "./form";
import { deleteEventAction } from "./actions";
import { formatDateID, formatTimeID } from "@/lib/utils";
import type { Event } from "@/lib/types";

type EventWithCreator = Event & { creatorLabel: string };

export default function EventsClient({
  upcoming,
  past,
  userId,
  isAdmin,
}: {
  upcoming: EventWithCreator[];
  past: EventWithCreator[];
  userId: string;
  isAdmin: boolean;
}) {
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const canEdit = (e: Event) => e.created_by === userId || isAdmin;

  return (
    <div className="space-y-6">
      {editTarget ? (
        <div>
          <EventForm editTarget={editTarget} />
          <button
            type="button"
            onClick={() => setEditTarget(null)}
            className="mt-2 btn btn-ghost text-sm"
          >
            <Icon name="arrow_back" className="text-base" /> Kembali
          </button>
        </div>
      ) : (
        <EventForm />
      )}

      <section>
        <h2 className="mb-3 text-headline-md flex items-center gap-2">
          <Icon name="upcoming" className="text-primary" /> Akan Datang ({upcoming.length})
        </h2>
        {upcoming.length ? (
          <ul className="space-y-3">
            {upcoming.map((e, i) => (
              <li
                key={e.id}
                className={
                  i === 0
                    ? "neon-card flex items-start gap-4 bg-surface-container/50 p-5"
                    : "glass-card flex items-start gap-4 p-5"
                }
              >
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-primary">
                  <div className="text-xs font-bold uppercase">
                    {new Date(e.event_date).toLocaleDateString("id-ID", { month: "short" })}
                  </div>
                  <div className="text-2xl font-extrabold leading-none">{new Date(e.event_date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-on-surface">{e.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="event" className="text-sm" /> {formatDateID(e.event_date)}
                    </span>
                    {e.event_time && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="schedule" className="text-sm" /> {formatTimeID(e.event_time)}
                      </span>
                    )}
                    {e.location && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="location_on" className="text-sm" /> {e.location}
                      </span>
                    )}
                  </div>
                  {e.description && <p className="mt-2 text-sm text-on-surface">{e.description}</p>}
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-xs text-on-surface-variant">
                    <Icon name="person" className="text-sm" /> Dibuat oleh:{" "}
                    <span className="font-semibold text-on-surface">{e.creatorLabel}</span>
                  </div>
                </div>
                {canEdit(e) && (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(e)}
                      className="btn btn-ghost text-primary hover:bg-primary/10"
                      aria-label="Edit acara"
                    >
                      <Icon name="edit" className="text-base" />
                    </button>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <SubmitButton
                        className="btn btn-ghost text-danger-red hover:bg-danger-red/10"
                        pendingLabel=""
                      >
                        <Icon name="delete" className="text-base" />
                      </SubmitButton>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-card p-8 text-center text-sm text-on-surface-variant">
            <Icon name="event_busy" className="text-3xl" />
            <p className="mt-2">Belum ada acara mendatang.</p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-headline-md flex items-center gap-2">
            <Icon name="history" className="text-on-surface-variant" /> Sudah Lewat ({past.length})
          </h2>
          <ul className="space-y-2">
            {past.map((e) => (
              <li key={e.id} className="glass-card flex items-center justify-between gap-3 p-4 opacity-70">
                <div>
                  <div className="font-semibold text-on-surface">{e.title}</div>
                  <div className="text-xs text-on-surface-variant">
                    {formatDateID(e.event_date)} · oleh {e.creatorLabel}
                  </div>
                </div>
                {canEdit(e) && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(e)}
                      className="btn btn-ghost text-xs text-primary hover:bg-primary/10"
                      aria-label="Edit"
                    >
                      <Icon name="edit" className="text-sm" />
                    </button>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <SubmitButton
                        className="btn btn-ghost text-xs text-danger-red hover:bg-danger-red/10"
                        pendingLabel=""
                      >
                        <Icon name="delete" className="text-sm" />
                      </SubmitButton>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
