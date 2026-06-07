"use client";

import { useActionState, useState } from "react";
import { createFamilyAction, joinByTokenAction, type ActionResult } from "../../onboarding/actions";

const initial: ActionResult = {};

export default function OnboardingPanel() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [createState, createForm, creating] = useActionState(createFamilyAction, initial);
  const [joinState, joinForm, joining] = useActionState(joinByTokenAction, initial);

  return (
    <div className="card">
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("create")}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === "create" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Buat Keluarga Baru
        </button>
        <button
          onClick={() => setTab("join")}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === "join" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Gabung dengan Kode
        </button>
      </div>

      {tab === "create" ? (
        <form action={createForm} className="space-y-4">
          <div>
            <label className="label" htmlFor="family_name">Nama Keluarga</label>
            <input className="input" id="family_name" name="family_name" type="text" placeholder="Keluarga Santoso" required />
          </div>
          <div>
            <label className="label" htmlFor="description">Deskripsi (opsional)</label>
            <textarea className="input min-h-24" id="description" name="description" placeholder="Ceritakan singkat tentang keluarga Anda" />
          </div>
          {createState.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{createState.error}</div>}
          <button className="btn btn-primary" type="submit" disabled={creating}>
            {creating ? "Membuat..." : "Buat Keluarga"}
          </button>
          <p className="text-xs text-slate-500">Anda akan otomatis menjadi Admin keluarga ini.</p>
        </form>
      ) : (
        <form action={joinForm} className="space-y-4">
          <div>
            <label className="label" htmlFor="token">Kode Undangan</label>
            <input className="input font-mono" id="token" name="token" type="text" placeholder="Tempel kode undangan di sini" required />
            <p className="mt-1 text-xs text-slate-500">Kode didapat dari admin keluarga setelah mereka mengundang email Anda.</p>
          </div>
          {joinState.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{joinState.error}</div>}
          <button className="btn btn-primary" type="submit" disabled={joining}>
            {joining ? "Memproses..." : "Gabung Keluarga"}
          </button>
        </form>
      )}
    </div>
  );
}
