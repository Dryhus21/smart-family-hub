import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { LogoWordmark } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import Iridescence from "@/components/effects/Iridescence";
import GradientText from "@/components/effects/GradientText";

const FEATURES = [
  {
    icon: "calendar_month",
    title: "Kalender Bersama",
    desc: "Sinkronisasi jadwal seluruh anggota keluarga. Tidak ada acara yang terlewat.",
    tone: "primary",
  },
  {
    icon: "assignment",
    title: "Tugas Rumah Tangga",
    desc: "Delegasikan dan lacak pekerjaan rumah dengan mudah. Pantau progres real-time.",
    tone: "secondary",
  },
  {
    icon: "note_alt",
    title: "Catatan Keluarga",
    desc: "Simpan daftar belanja, resep, dan informasi penting dalam satu tempat.",
    tone: "tertiary",
  },
  {
    icon: "notifications_active",
    title: "Notifikasi Otomatis",
    desc: "Pengingat cerdas untuk acara mendatang dan deadline tugas.",
    tone: "success",
  },
];

const TONE: Record<string, { text: string; bg: string }> = {
  primary: { text: "text-primary", bg: "bg-white/70" },
  secondary: { text: "text-secondary", bg: "bg-white/70" },
  tertiary: { text: "text-tertiary", bg: "bg-white/70" },
  success: { text: "text-success-green", bg: "bg-white/70" },
};

export default async function Home() {
  const ctx = await getAuthContext();
  if (ctx) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="iridescence-bg">
        <Iridescence
          color={[0.47, 0.64, 0.82]}
          mouseReact={false}
          amplitude={0.1}
          speed={0.7}
        />
      </div>

      <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/30 bg-glass-bg px-5 backdrop-blur-md md:px-10">
        <LogoWordmark />
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-white/40">
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 md:px-10">
        <section className="relative z-10 mb-32 flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
            <Icon name="auto_awesome" className="text-base" /> VERSI 1.0 · JUNI 2026
          </span>

          <h1 className="mb-6 max-w-3xl" style={{fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: '1.12', fontWeight: 800, letterSpacing: '-0.03em'}}>
            <GradientText
              colors={["#ffffff", "#FEFFAF", "#cce4ff", "#ffffff"]}
              animationSpeed={5}
              className="leading-none"
            >
              Kelola Keluarga Anda dalam Satu Dashboard Cerdas
            </GradientText>
          </h1>

          <p className="mb-10 max-w-2xl text-headline-md font-normal text-white/90">
            Tingkatkan kolaborasi keluarga dengan dashboard pintar. Harmonisasi jadwal, tugas, dan komunikasi dalam satu tempat yang tenang.
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

          <div className="mt-16 w-full max-w-5xl rounded-2xl border border-white/60 bg-white/60 p-2 backdrop-blur-xl">
            <div className="rounded-xl border border-white/70 bg-surface-container/80 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-danger-red/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-success-green/70" />
                <span className="ml-3 text-xs text-on-surface/70">smart-family-hub.app/dashboard</span>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { label: "Anggota", value: "4", icon: "group", color: "text-primary" },
                  { label: "Tugas Aktif", value: "12", icon: "check_circle", color: "text-success-green" },
                  { label: "Acara", value: "5", icon: "event_upcoming", color: "text-tertiary" },
                  { label: "Catatan", value: "8", icon: "note_alt", color: "text-secondary" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/70 bg-white/70 p-3">
                    <div className={`flex items-center gap-1.5 text-xs ${s.color}`}>
                      <Icon name={s.icon} className="text-sm" />
                      {s.label}
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-on-surface">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Rapat Orang Tua", "Belanja Mingguan", "Ulang Tahun Ibu"].map((t) => (
                  <div key={t} className="rounded-lg border border-white/70 bg-white/55 p-3">
                    <div className="text-xs text-on-surface-variant">12 Jun · 14:00</div>
                    <div className="mt-1 text-sm font-semibold text-on-surface">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md font-extrabold text-white">Fitur Utama</h2>
            <p className="mt-2 text-white/80">Semua yang dibutuhkan untuk mengelola keluarga modern.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const t = TONE[f.tone];
              return (
                <div key={f.title} className="glass-card neon-card p-6">
                  <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${t.bg} ${t.text} ring-1 ring-white/70`}>
                    <Icon name={f.icon} filled />
                  </div>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/30 py-8 text-center text-sm text-white/70">
          © 2026 Smart Family Hub · Dryhus Dzacky Damingtyas
        </footer>
      </main>
    </div>
  );
}
