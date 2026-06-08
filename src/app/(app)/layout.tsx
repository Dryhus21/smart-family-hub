import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { NavSidebarLink, NavBottomLink } from "@/components/AppNav";
import { logoutAction } from "../(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/calendar", label: "Kalender", icon: "calendar_month" },
  { href: "/events", label: "Acara", icon: "celebration" },
  { href: "/tasks", label: "Tugas", icon: "assignment_turned_in" },
  { href: "/notes", label: "Catatan", icon: "note_alt" },
  { href: "/family", label: "Keluarga", icon: "groups" },
  { href: "/activity", label: "Riwayat", icon: "history" },
];

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/calendar", label: "Kalender", icon: "calendar_month" },
  { href: "/tasks", label: "Tugas", icon: "assignment_turned_in" },
  { href: "/family", label: "Keluarga", icon: "groups" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();

  if (!ctx) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-3xl p-4 md:p-8">{children}</main>
      </div>
    );
  }

  if (!ctx.family) {
    return (
      <div className="min-h-screen">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 md:px-10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size={36} />
            <span className="font-extrabold text-primary text-lg">FamilyHub</span>
          </Link>
          <form action={logoutAction}>
            <SubmitButton className="btn btn-secondary text-sm" pendingLabel="Keluar...">
              <Icon name="logout" className="text-base" /> Keluar
            </SubmitButton>
          </form>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-12 md:px-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Soft background bends across app */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 90% 10%, rgba(243,227,208,0.45), transparent 70%), radial-gradient(ellipse 40% 35% at 10% 95%, rgba(210,196,180,0.4), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] border-r border-white/40 bg-glass-bg-strong shadow-[8px_0_30px_-12px_rgba(47,91,120,0.2)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-full flex-col gap-6 px-4 py-6">
          {/* Header */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <Logo size={44} />
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-primary">{ctx.family.family_name}</h1>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                Family Hub
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((n) => (
              <NavSidebarLink key={n.href} href={n.href} icon={n.icon} label={n.label} />
            ))}
          </nav>

          {/* User card */}
          <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary-strong font-bold text-on-primary">
              {ctx.profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-semibold text-on-surface">{ctx.profile.full_name}</div>
              <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {ctx.isAdmin ? "Admin" : "Anggota"}
              </div>
            </div>
            <form action={logoutAction}>
              <SubmitButton
                className="rounded-lg p-2 text-on-surface-variant transition hover:bg-danger-red/10 hover:text-danger-red"
                pendingLabel=""
              >
                <Icon name="logout" className="text-base" />
              </SubmitButton>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/60 bg-glass-bg-strong px-4 backdrop-blur-lg lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-sm font-extrabold text-primary">{ctx.family.family_name}</span>
        </Link>
        <form action={logoutAction}>
          <SubmitButton className="rounded-lg p-2 text-on-surface-variant" pendingLabel="">
            <Icon name="logout" className="text-base" />
          </SubmitButton>
        </form>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[90%] -translate-x-1/2 items-center justify-around rounded-full border border-white/70 bg-glass-bg-strong p-2 shadow-[0_8px_30px_-8px_rgba(47,91,120,0.35)] backdrop-blur-lg lg:hidden">
        {BOTTOM_NAV.map((n) => (
          <NavBottomLink key={n.href} href={n.href} icon={n.icon} label={n.label} />
        ))}
      </nav>

      {/* Main content */}
      <main className="min-h-screen pt-20 pb-28 lg:ml-[280px] lg:pt-0 lg:pb-10">
        <div className="px-5 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
