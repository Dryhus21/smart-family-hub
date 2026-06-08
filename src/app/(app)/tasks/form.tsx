"use client";

import { useActionState, useState } from "react";
import { createTaskAction, type ActionResult } from "./actions";
import { Icon } from "@/components/Icon";

const initial: ActionResult = {};

export default function TaskForm({ members }: { members: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTaskAction, initial);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary px-5 py-2.5">
        <Icon name="add_task" className="text-base" /> Tambah Tugas
      </button>
    );
  }

  return (
    <div className="glass-card neon-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-headline-md text-primary">Tugas Baru</h2>
        <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface">
          <Icon name="close" className="text-base" />
        </button>
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
        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">
            <Icon name="error" className="text-base" /> <span>{state.error}</span>
          </div>
        )}
        {state.success && (
          <div className="flex items-start gap-2 rounded-lg border border-success-green/40 bg-success-green/10 px-3 py-2 text-sm text-success-green">
            <Icon name="check_circle" className="text-base" /> <span>{state.success}</span>
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
