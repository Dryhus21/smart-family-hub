"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "../actions";
import { LogoWordmark } from "@/components/Logo";
import { DotField, ColorBends } from "@/components/effects/DotField";
import GradientText from "@/components/effects/GradientText";
import { Icon } from "@/components/Icon";

const initial: ActionResult = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <DotField />
      <ColorBends />

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <LogoWordmark size={40} />
          </Link>
        </div>

        <div className="glass-card neon-card p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <GradientText colors={["#c0c1ff", "#ddb7ff", "#c0c1ff"]} animationSpeed={5}>
              Masuk ke Akun
            </GradientText>
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">Selamat datang kembali!</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input className="input" id="email" name="email" type="email" placeholder="kamu@email.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input className="input" id="password" name="password" type="password" required />
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
                  <Icon name="login" className="text-base" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
