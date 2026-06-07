"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-slate-600">{error.message || "Terjadi kesalahan."}</p>
        {error.digest && <p className="mt-1 text-xs text-slate-400">digest: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => reset()} className="btn btn-primary">Coba Lagi</button>
          <Link href="/dashboard" className="btn btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
