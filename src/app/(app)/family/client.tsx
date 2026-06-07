"use client";

import { useActionState, useState } from "react";
import { inviteMemberAction, updateFamilyAction, type ActionResult } from "./actions";
import type { Family } from "@/lib/types";

const initial: ActionResult = {};

export default function FamilyClient({ family }: { family: Family }) {
  const [editing, setEditing] = useState(false);
  const [editState, editForm, editing2] = useActionState(updateFamilyAction, initial);
  const [inviteState, inviteForm, inviting] = useActionState(inviteMemberAction, initial);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Profil Keluarga</h2>
          {!editing && <button onClick={() => setEditing(true)} className="btn btn-secondary text-sm">Edit</button>}
        </div>
        {editing ? (
          <form action={editForm} className="space-y-3">
            <div>
              <label className="label" htmlFor="family_name">Nama Keluarga</label>
              <input className="input" id="family_name" name="family_name" defaultValue={family.family_name} required />
            </div>
            <div>
              <label className="label" htmlFor="description">Deskripsi</label>
              <textarea className="input min-h-20" id="description" name="description" defaultValue={family.description ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="photo_url">URL Foto Keluarga (opsional)</label>
              <input className="input" id="photo_url" name="photo_url" type="url" defaultValue={family.photo_url ?? ""} placeholder="https://..." />
            </div>
            {editState.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{editState.error}</div>}
            {editState.success && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{editState.success}</div>}
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={editing2}>{editing2 ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Batal</button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-slate-600">
            <div><strong>Nama:</strong> {family.family_name}</div>
            {family.description && <div className="mt-1"><strong>Deskripsi:</strong> {family.description}</div>}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-slate-900">Undang Anggota</h2>
        <form action={inviteForm} className="flex flex-wrap gap-2">
          <input className="input flex-1 min-w-48" name="email" type="email" placeholder="email@anggota.com" required />
          <button className="btn btn-primary" type="submit" disabled={inviting}>{inviting ? "Memproses..." : "Kirim Undangan"}</button>
        </form>
        {inviteState.error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{inviteState.error}</div>}
        {inviteState.success && inviteState.token && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800">
            <div className="font-medium">{inviteState.success}</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-white px-2 py-1 font-mono text-xs">{inviteState.token}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteState.token!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-secondary text-xs"
              >
                {copied ? "✓ Disalin" : "Salin"}
              </button>
            </div>
            <p className="mt-2 text-xs">Bagikan kode ini ke anggota - mereka pakai di halaman onboarding setelah daftar dengan email yang sama.</p>
          </div>
        )}
      </div>
    </div>
  );
}
