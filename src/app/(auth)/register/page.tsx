"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionResult } from "../actions";
import { LogoWordmark } from "@/components/Logo";
import Iridescence from "@/components/effects/Iridescence";
import GradientText from "@/components/effects/GradientText";
import { Icon } from "@/components/Icon";

const initial: ActionResult = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="iridescence-bg">
        <Iridescence color={[0.47, 0.64, 0.82]} mouseReact={false} amplitude={0.1} speed={0.7} />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <LogoWordmark size={40} />
          </Link>
        </div>

        <div className="glass-card-strong neon-card p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <GradientText colors={["#1e3f62", "#78A2D2", "#a8aa20", "#1e3f62"]} animationSpeed={5}>
              Daftar Akun Baru
            </GradientText>
          </h1>
          <p className="mt-2 text-sm text-on-surface/80">
            Buat akun untuk mulai mengelola keluarga Anda dengan cerdas.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="full_name">Nama Lengkap</label>
              <input className="input" id="full_name" name="full_name" type="text" placeholder="Dryhus Damingtyas" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input className="input" id="email" name="email" type="email" placeholder="kamu@email.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input className="input" id="password" name="password" type="password" placeholder="Minimal 6 karakter" required minLength={6} />
            </div>

            {state.error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">
                <Icon name="error" className="text-base" />
                <span>{state.error}</span>
              </div>
            )}

            <button className="btn btn-primary w-full py-3" type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Icon name="autorenew" className="animate-spin text-base" />
                  Memproses...
                </>
              ) : (
                <>
                  <Icon name="how_to_reg" className="text-base" />
                  Daftar Akun
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
