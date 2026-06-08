"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="glass-card neon-card p-8">
        <h1 className="text-xl font-extrabold text-on-surface">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{error.message || "Terjadi kesalahan."}</p>
        {error.digest && <p className="mt-1 text-xs text-on-surface-variant opacity-60">digest: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => reset()} className="btn btn-primary">Coba Lagi</button>
          <Link href="/dashboard" className="btn btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
