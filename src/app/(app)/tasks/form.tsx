"use client";

import { useActionState, useState } from "react";
import { createTaskAction, type ActionResult } from "./actions";

const initial: ActionResult = {};

export default function TaskForm({ members }: { members: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTaskAction, initial);

  if (!open) return <button onClick={() => setOpen(true)} className="btn btn-primary">+ Tambah Tugas</button>;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Tugas Baru</h2>
        <button onClick={() => setOpen(false)} className="text-slate-500">✕</button>
      </div>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="task_name">Nama Tugas *</label>
          <input className="input" id="task_name" name="task_name" required placeholder="Cuci piring" />
        </div>
        <div>
          <label className="label" htmlFor="description">Deskripsi</label>
          <textarea className="input min-h-20" id="description" name="description" placeholder="Detail tugas..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="assigned_to">Penanggung Jawab</label>
            <select className="input" id="assigned_to" name="assigned_to" defaultValue="">
              <option value="">— Belum ditugaskan —</option>
              {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="deadline">Deadline</label>
            <input className="input" id="deadline" name="deadline" type="date" />
          </div>
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
