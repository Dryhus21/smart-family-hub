"use client";

import { useActionState, useState } from "react";
import { inviteMemberAction, updateFamilyAction, type ActionResult } from "./actions";
import type { Family } from "@/lib/types";
import { Icon } from "@/components/Icon";

const initial: ActionResult = {};

export default function FamilyClient({ family }: { family: Family }) {
  const [editing, setEditing] = useState(false);
  const [editState, editForm, editing2] = useActionState(updateFamilyAction, initial);
  const [inviteState, inviteForm, inviting] = useActionState(inviteMemberAction, initial);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="glass-card neon-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-headline-md text-primary">
            <Icon name="badge" filled /> Profil Keluarga
          </h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-secondary text-sm">
              <Icon name="edit" className="text-base" /> Edit
            </button>
          )}
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
            {editState.error && <div className="rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">{editState.error}</div>}
            {editState.success && <div className="rounded-lg border border-success-green/40 bg-success-green/10 px-3 py-2 text-sm text-success-green">{editState.success}</div>}
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={editing2}>
                {editing2 ? <><Icon name="autorenew" className="animate-spin text-base" /> Menyimpan...</> : <><Icon name="check" className="text-base" /> Simpan</>}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Batal</button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-on-surface-variant">
            <div><span className="font-semibold text-on-surface">Nama:</span> {family.family_name}</div>
            {family.description && <div className="mt-1"><span className="font-semibold text-on-surface">Deskripsi:</span> {family.description}</div>}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-headline-md">
          <Icon name="person_add" /> Undang Anggota
        </h2>
        <form action={inviteForm} className="flex flex-wrap gap-2">
          <input className="input min-w-48 flex-1" name="email" type="email" placeholder="email@anggota.com" required />
          <button className="btn btn-primary" type="submit" disabled={inviting}>
            {inviting ? <><Icon name="autorenew" className="animate-spin text-base" /> Memproses...</> : <><Icon name="send" className="text-base" /> Kirim Undangan</>}
          </button>
        </form>
        {inviteState.error && <div className="mt-3 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">{inviteState.error}</div>}
        {inviteState.success && inviteState.token && (
          <div className="mt-3 rounded-lg border border-success-green/40 bg-success-green/10 px-3 py-3 text-sm text-success-green">
            <div className="font-semibold">{inviteState.success}</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-surface-container-low px-2 py-1 font-mono text-xs text-on-surface">{inviteState.token}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteState.token!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-secondary text-xs"
              >
                {copied ? <><Icon name="check" className="text-sm" /> Disalin</> : <><Icon name="content_copy" className="text-sm" /> Salin</>}
              </button>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">Bagikan kode ini ke anggota. Mereka pakai di halaman onboarding setelah daftar dengan email yang sama.</p>
          </div>
        )}
      </div>
    </div>
  );
}
