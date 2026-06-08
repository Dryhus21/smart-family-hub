"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#13131b] text-[#e4e1ed] antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
          <div className="rounded-xl border border-white/10 bg-[rgba(31,31,39,0.7)] p-8 backdrop-blur-md">
            <h1 className="text-2xl font-extrabold">Terjadi Kesalahan</h1>
            <p className="mt-2 text-sm text-[#c7c4d7]">Maaf, ada masalah saat memuat halaman.</p>
            <p className="mt-3 break-words rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-xs text-red-300">
              {error.message || "Unknown error"}
              {error.digest && <span className="block opacity-70">digest: {error.digest}</span>}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => reset()} className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110">
                Coba Lagi
              </button>
              <Link href="/" className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
