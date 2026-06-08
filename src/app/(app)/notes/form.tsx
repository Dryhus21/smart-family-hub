"use client";

import { useActionState, useState } from "react";
import { createNoteAction, type ActionResult } from "./actions";
import { Icon } from "@/components/Icon";

const initial: ActionResult = {};

export default function NoteForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createNoteAction, initial);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary px-5 py-2.5">
        <Icon name="note_add" className="text-base" /> Catatan Baru
      </button>
    );
  }

  return (
    <div className="glass-card neon-card p-6">
      <form action={formAction} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-md text-primary">Catatan Baru</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5">
            <Icon name="close" className="text-base" />
          </button>
        </div>
        <div>
          <label className="label" htmlFor="title">Judul *</label>
          <input className="input" id="title" name="title" required placeholder="Resep Nasi Goreng Mama" />
        </div>
        <div>
          <label className="label" htmlFor="content">Isi *</label>
          <textarea className="input min-h-32" id="content" name="content" required placeholder="Tulis catatan di sini..." />
        </div>
        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">
            <Icon name="error" className="text-base" /> <span>{state.error}</span>
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1 py-2.5" type="submit" disabled={pending}>
            {pending ? <><Icon name="autorenew" className="animate-spin text-base" /> Menyimpan...</> : <><Icon name="check" className="text-base" /> Simpan</>}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
