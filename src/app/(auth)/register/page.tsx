"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionResult } from "../actions";

const initial: ActionResult = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">SF</div>
            <span className="text-xl font-semibold text-slate-900">Smart Family Hub</span>
          </Link>
        </div>
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
          <p className="mt-1 text-sm text-slate-600">Buat akun untuk mulai mengelola keluarga Anda.</p>
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="full_name">Nama Lengkap</label>
              <input className="input" id="full_name" name="full_name" type="text" placeholder="Budi Santoso" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input className="input" id="email" name="email" type="email" placeholder="budi@email.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input className="input" id="password" name="password" type="password" placeholder="Minimal 6 karakter" required minLength={6} />
            </div>
            {state.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
            <button className="btn btn-primary w-full" type="submit" disabled={pending}>
              {pending ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
