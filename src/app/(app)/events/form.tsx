"use client";

import { useActionState, useState } from "react";
import { createEventAction, type ActionResult } from "./actions";

const initial: ActionResult = {};

export default function EventForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createEventAction, initial);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary">+ Tambah Acara</button>
    );
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Acara Baru</h2>
        <button onClick={() => setOpen(false)} className="text-slate-500">✕</button>
      </div>
      <form action={async (fd) => { await formAction(fd); }} className="space-y-4">
        <div>
          <label className="label" htmlFor="title">Judul Acara *</label>
          <input className="input" id="title" name="title" required placeholder="Ulang tahun Ibu" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="event_date">Tanggal *</label>
            <input className="input" id="event_date" name="event_date" type="date" required />
          </div>
          <div>
            <label className="label" htmlFor="event_time">Waktu</label>
            <input className="input" id="event_time" name="event_time" type="time" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Lokasi</label>
          <input className="input" id="location" name="location" placeholder="Restoran Sederhana" />
        </div>
        <div>
          <label className="label" htmlFor="description">Deskripsi</label>
          <textarea className="input min-h-24" id="description" name="description" placeholder="Detail tambahan..." />
        </div>
        {state.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
        {state.success && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</div>}
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
