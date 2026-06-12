"use client";

import { useActionState, useState, useEffect } from "react";
import { createEventAction, updateEventAction, type ActionResult } from "./actions";
import { Icon } from "@/components/Icon";
import type { Event } from "@/lib/types";

const initial: ActionResult = {};

type Props = { editTarget?: Event | null };

export default function EventForm({ editTarget }: Props) {
  const [open, setOpen] = useState(!!editTarget);
  const [state, formAction, pending] = useActionState(
    editTarget ? updateEventAction : createEventAction,
    initial
  );

  // Close on success
  useEffect(() => {
    if (state.success && !editTarget) setOpen(false);
  }, [state.success, editTarget]);

  if (!open && !editTarget) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary px-5 py-2.5">
        <Icon name="add" className="text-base" /> Tambah Acara
      </button>
    );
  }

  const defaultValues = editTarget ?? null;

  return (
    <div className="glass-card neon-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-headline-md text-primary">
          {editTarget ? "Edit Acara" : "Acara Baru"}
        </h2>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          aria-label="Tutup"
        >
          <Icon name="close" className="text-base" />
        </button>
      </div>
      <form action={formAction} className="space-y-4">
        {editTarget && <input type="hidden" name="id" value={editTarget.id} />}
        <div>
          <label className="label" htmlFor="title">Judul Acara *</label>
          <input
            className="input"
            id="title"
            name="title"
            required
            placeholder="Ulang tahun Ibu"
            defaultValue={defaultValues?.title ?? ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="event_date">Tanggal *</label>
            <input
              className="input"
              id="event_date"
              name="event_date"
              type="date"
              required
              defaultValue={defaultValues?.event_date ?? ""}
            />
          </div>
          <div>
            <label className="label" htmlFor="event_time">Waktu</label>
            <input
              className="input"
              id="event_time"
              name="event_time"
              type="time"
              defaultValue={defaultValues?.event_time ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Lokasi</label>
          <input
            className="input"
            id="location"
            name="location"
            placeholder="Restoran Sederhana"
            defaultValue={defaultValues?.location ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="description">Deskripsi</label>
          <textarea
            className="input min-h-24"
            id="description"
            name="description"
            placeholder="Detail tambahan..."
            defaultValue={defaultValues?.description ?? ""}
          />
        </div>
        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">
            <Icon name="error" className="text-base" />
            <span>{state.error}</span>
          </div>
        )}
        {state.success && (
          <div className="flex items-start gap-2 rounded-lg border border-success-green/40 bg-success-green/10 px-3 py-2 text-sm text-success-green">
            <Icon name="check_circle" className="text-base" />
            <span>{state.success}</span>
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1 py-2.5" type="submit" disabled={pending}>
            {pending ? (
              <><Icon name="autorenew" className="animate-spin text-base" /> Menyimpan...</>
            ) : (
              <><Icon name="check" className="text-base" /> {editTarget ? "Perbarui" : "Simpan"}</>
            )}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
