import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { logoutAction } from "../(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/calendar", label: "Kalender", icon: "📅" },
  { href: "/events", label: "Acara", icon: "🎉" },
  { href: "/tasks", label: "Tugas", icon: "✅" },
  { href: "/notes", label: "Catatan", icon: "📝" },
  { href: "/family", label: "Keluarga", icon: "👨‍👩‍👧" },
  { href: "/activity", label: "Riwayat", icon: "📜" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  // Don't redirect from layout — child pages handle auth themselves to avoid
  // redirect loops when session state is ambiguous.
  if (!ctx) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-3xl p-4 md:p-8">{children}</main>
      </div>
    );
  }

  // If the user has no family, render the children without the navigation
  // chrome. Individual pages (notably /dashboard) will render the onboarding
  // experience inline. This avoids a server-side redirect from inside this
  // layout, which can interact badly with the route-group error boundary on
  // Next.js 16 turbopack and leave the page blank.
  if (!ctx.family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">SF</div>
            <span className="font-semibold text-slate-900">Smart Family Hub</span>
          </Link>
          <form action={logoutAction}>
            <button className="btn btn-ghost text-sm" type="submit">🚪 Keluar</button>
          </form>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 p-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">SF</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Smart Family Hub</div>
                <div className="text-xs text-slate-500">{ctx.family.family_name}</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {ctx.profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-medium text-slate-900">{ctx.profile.full_name}</div>
                <div className="truncate text-xs text-slate-500">{ctx.isAdmin ? "Admin" : "Anggota"}</div>
              </div>
            </div>
            <form action={logoutAction}>
              <button className="btn btn-ghost mt-2 w-full justify-start text-sm" type="submit">🚪 Logout</button>
            </form>
          </div>
        </aside>

        <div className="flex w-full flex-col md:ml-0">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">SF</div>
              <span className="font-semibold text-slate-900">Family Hub</span>
            </Link>
            <form action={logoutAction}>
              <button className="text-sm text-slate-600" type="submit">Keluar</button>
            </form>
          </header>
          <nav className="border-b border-slate-200 bg-white px-2 py-2 md:hidden">
            <div className="flex gap-1 overflow-x-auto">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <span>{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
