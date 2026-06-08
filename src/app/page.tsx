import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { LogoWordmark } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { DotField, ColorBends } from "@/components/effects/DotField";
import GradientText from "@/components/effects/GradientText";

const FEATURES = [
  {
    icon: "calendar_month",
    color: "text-primary",
    bg: "bg-primary-container/20",
    title: "Kalender Bersama",
    desc: "Sinkronisasi jadwal seluruh anggota keluarga secara real-time. Tidak ada lagi acara yang terlewat.",
  },
  {
    icon: "assignment",
    color: "text-secondary",
    bg: "bg-secondary-container/20",
    title: "Tugas Rumah Tangga",
    desc: "Delegasikan dan lacak pekerjaan rumah dengan mudah. Pantau progres setiap anggota.",
  },
  {
    icon: "note_alt",
    color: "text-tertiary",
    bg: "bg-tertiary-container/20",
    title: "Catatan Keluarga",
    desc: "Simpan daftar belanja, resep, dan informasi penting lainnya dalam satu tempat terpusat.",
  },
  {
    icon: "notifications_active",
    color: "text-success-green",
    bg: "bg-success-green/20",
    title: "Notifikasi Otomatis",
    desc: "Pengingat cerdas untuk acara mendatang dan deadline tugas keluarga.",
  },
];

export default async function Home() {
  const ctx = await getAuthContext();
  if (ctx) redirect("/dashboard");

  return (
    <div className="relative min-h-screen">
      <DotField />
      <ColorBends />

      <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-glass-bg px-5 backdrop-blur-md md:px-10">
        <LogoWordmark />
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary">
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 pt-32 pb-24 md:px-10">
        <section className="mb-32 flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-border bg-glass-bg px-4 py-1.5 text-xs font-semibold tracking-wider text-primary backdrop-blur-md">
            <Icon name="auto_awesome" className="text-base" /> VERSI 1.0 · JUNI 2026
          </span>

          <h1 className="mb-6 max-w-4xl text-display-lg-mobile md:text-display-lg">
            <GradientText
              colors={["#c0c1ff", "#ddb7ff", "#2fd9f4", "#c0c1ff"]}
              animationSpeed={6}
              className="leading-[1.1]"
            >
              Kelola Keluarga Anda dalam Satu Dashboard Cerdas
            </GradientText>
          </h1>

          <p className="mb-10 max-w-2xl text-headline-md text-on-surface-variant">
            Tingkatkan kolaborasi keluarga dengan dashboard pintar. Harmonisasi jadwal, tugas, dan komunikasi dalam satu tempat.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-6 py-3 text-sm">
              <Icon name="rocket_launch" />
              Mulai Sekarang
            </Link>
            <Link href="/login" className="btn btn-outline px-6 py-3 text-sm">
              Saya Sudah Punya Akun
            </Link>
          </div>

          <div className="mt-16 w-full max-w-5xl rounded-xl border border-neon-border bg-glass-bg p-2 backdrop-blur-xl">
            <div className="rounded-lg border border-white/5 bg-surface-container-low/80 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-danger-red/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-success-green/70" />
                <span className="ml-3 text-xs text-on-surface-variant">smart-family-hub.app/dashboard</span>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { label: "Anggota", value: "4", icon: "group", color: "text-primary" },
                  { label: "Tugas Aktif", value: "12", icon: "check_circle", color: "text-tertiary" },
                  { label: "Acara", value: "5", icon: "event_upcoming", color: "text-secondary" },
                  { label: "Catatan", value: "8", icon: "note_alt", color: "text-success-green" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/10 bg-surface-container/60 p-3">
                    <div className={`flex items-center gap-1.5 text-xs ${s.color}`}>
                      <Icon name={s.icon} className="text-sm" />
                      {s.label}
                    </div>
                    <div className="mt-1 text-2xl font-extrabold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Rapat Orang Tua", "Belanja Mingguan", "Ulang Tahun Ibu"].map((t, i) => (
                  <div key={t} className="rounded-lg border border-white/10 bg-surface-container/40 p-3">
                    <div className="text-xs text-on-surface-variant">12 Jun · 14:00</div>
                    <div className="mt-1 text-sm font-semibold text-on-surface">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md font-extrabold">Fitur Utama</h2>
            <p className="mt-2 text-on-surface-variant">Semua yang dibutuhkan untuk mengelola keluarga modern.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card neon-card p-6">
                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${f.bg} ${f.color}`}>
                  <Icon name={f.icon} filled />
                </div>
                <h3 className={`text-lg font-bold ${f.color}`}>{f.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-sm text-on-surface-variant">
          © 2026 Smart Family Hub · Dryhus Dzacky Damingtyas
        </footer>
      </main>
    </div>
  );
}
