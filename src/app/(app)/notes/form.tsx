"use client";

import { useActionState, useState } from "react";
import { createNoteAction, type ActionResult } from "./actions";

const initial: ActionResult = {};

export default function NoteForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createNoteAction, initial);

  if (!open) return <button onClick={() => setOpen(true)} className="btn btn-primary">+ Catatan Baru</button>;

  return (
    <div className="card">
      <form action={formAction} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Catatan Baru</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-500">✕</button>
        </div>
        <div>
          <label className="label" htmlFor="title">Judul *</label>
          <input className="input" id="title" name="title" required placeholder="Resep Nasi Goreng Mama" />
        </div>
        <div>
          <label className="label" htmlFor="content">Isi *</label>
          <textarea className="input min-h-32" id="content" name="content" required placeholder="Tulis catatan di sini..." />
        </div>
        {state.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
