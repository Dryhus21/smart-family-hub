"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/SubmitButton";
import { updateProfileAction, type ActionResult } from "./actions";
import type { Profile } from "@/lib/types";

const initial: ActionResult = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="label" htmlFor="full_name">Nama Lengkap</label>
        <input
          className="input"
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile.full_name}
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input opacity-60" id="email" name="email" type="email" defaultValue={profile.email} disabled />
        <p className="mt-1.5 text-xs text-on-surface-variant">Email tidak dapat diubah</p>
      </div>

      <div>
        <label className="label" htmlFor="birth_date">Tanggal Lahir</label>
        <input
          className="input"
          id="birth_date"
          name="birth_date"
          type="date"
          defaultValue={profile.birth_date ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Deskripsi / Bio</label>
        <textarea
          className="input min-h-28"
          id="description"
          name="description"
          placeholder="Ceritakan singkat tentang diri kamu..."
          defaultValue={profile.description ?? ""}
          maxLength={500}
        />
        <p className="mt-1.5 text-xs text-on-surface-variant">Maksimal 500 karakter</p>
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

      <SubmitButton className="btn btn-primary w-full py-3" pendingLabel="Menyimpan...">
        <Icon name="save" className="text-base" /> Simpan Perubahan
      </SubmitButton>
    </form>
  );
}
