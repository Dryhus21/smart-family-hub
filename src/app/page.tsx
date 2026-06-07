import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";

export default async function Home() {
  const ctx = await getAuthContext();
  if (ctx) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">SF</div>
          <span className="text-lg font-semibold text-slate-900">Smart Family Hub</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Masuk</Link>
          <Link href="/register" className="btn btn-primary">Daftar Gratis</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="badge bg-indigo-100 text-indigo-700">Versi 1.0 - Juni 2026</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Kelola Keluarga Anda dalam Satu Dashboard Cerdas
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Smart Family Hub membantu keluarga berkolaborasi dalam mengelola kalender, tugas rumah tangga, catatan, dan acara penting - semua tersinkronisasi otomatis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary px-6 py-3">Mulai Sekarang</Link>
              <Link href="/login" className="btn btn-secondary px-6 py-3">Saya Sudah Punya Akun</Link>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { t: "Kalender Bersama", d: "Lihat semua acara keluarga dalam satu tampilan kalender interaktif." },
              { t: "Tugas Rumah Tangga", d: "Bagi tugas, atur deadline, dan pantau status real-time." },
              { t: "Catatan Keluarga", d: "Simpan resep, daftar belanja, dan pengingat bersama." },
              { t: "Notifikasi Otomatis", d: "Reminder acara dan deadline langsung di dashboard." },
            ].map((f) => (
              <div key={f.t} className="card">
                <h3 className="font-semibold text-slate-900">{f.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        &copy; 2026 Smart Family Hub - Dryhus Dzacky Damingtyas
      </footer>
    </div>
  );
}
