import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { NavBottomLink } from "@/components/AppNav";
import { DesktopSidebar } from "@/components/Sidebar";
import { logoutAction } from "../(auth)/actions";

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/calendar", label: "Kalender", icon: "calendar_month" },
  { href: "/events", label: "Acara", icon: "celebration" },
  { href: "/tasks", label: "Tugas", icon: "assignment_turned_in" },
  { href: "/notes", label: "Catatan", icon: "note_alt" },
  { href: "/family", label: "Keluarga", icon: "groups" },
  { href: "/activity", label: "Riwayat", icon: "history" },
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

      <DesktopSidebar ctx={ctx as Parameters<typeof DesktopSidebar>[0]["ctx"]} />

      {/* Mobile top bar */}
      <header className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/60 bg-glass-bg-strong px-4 backdrop-blur-lg lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size={34} className="shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold tracking-tight text-on-surface">{ctx.family.family_name}</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface/70">Smart Living</span>
          </div>
        </Link>
        <form action={logoutAction}>
          <SubmitButton className="rounded-lg p-2 text-on-surface-variant" pendingLabel="">
            <Icon name="logout" className="text-base" />
          </SubmitButton>
        </form>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[95%] max-w-md -translate-x-1/2 items-center justify-between gap-0.5 rounded-2xl border border-white/70 bg-glass-bg-strong px-2 py-1.5 shadow-[0_8px_30px_-8px_rgba(47,91,120,0.35)] backdrop-blur-lg lg:hidden">
        {BOTTOM_NAV.map((n) => (
          <NavBottomLink key={n.href} href={n.href} icon={n.icon} label={n.label} />
        ))}
      </nav>

      {/* Main content */}
      <main className="min-h-screen pt-20 pb-28 lg:ml-[64px] lg:pt-0 lg:pb-10">
        <div className="px-5 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
