"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Terjadi Kesalahan</h1>
            <p className="mt-2 text-sm text-slate-600">
              Maaf, ada masalah saat memuat halaman.
            </p>
            <p className="mt-3 break-words rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-700">
              {error.message || "Unknown error"}
              {error.digest && <span className="block opacity-70">digest: {error.digest}</span>}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => reset()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Coba Lagi
              </button>
              <Link href="/" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
