"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Spinner } from "./SubmitButton";
import { SubmitButton } from "./SubmitButton";
import { logoutAction } from "@/app/(auth)/actions";
import type { AuthContext } from "@/lib/auth";

type LoggedInCtx = AuthContext & { family: NonNullable<AuthContext["family"]> };

type NavItem = { href: string; label: string; icon: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/calendar", label: "Kalender", icon: "calendar_month" },
  { href: "/events", label: "Acara", icon: "celebration" },
  { href: "/tasks", label: "Tugas", icon: "assignment_turned_in" },
  { href: "/notes", label: "Catatan", icon: "note_alt" },
  { href: "/family", label: "Keluarga", icon: "groups" },
  { href: "/profile", label: "Profil", icon: "account_circle" },
  { href: "/activity", label: "Riwayat", icon: "history" },
];

function SidebarLink({ href, icon, label }: NavItem) {
  const pathname = usePathname();
  const { pending } = useLinkStatus();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch
      title={label}
      className={`group/link relative flex h-11 items-center overflow-hidden rounded-xl transition-all duration-200 ${
        active
          ? "border-r-4 border-[#004953] bg-[#004953]/25 text-[#04222a] backdrop-blur-md"
          : "text-[#04222a] hover:bg-[#004953]/20 hover:text-[#04222a] hover:backdrop-blur-md"
      }`}
    >
      {/* Icon — fixed 44px column so it stays centered when collapsed */}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        {pending ? (
          <Spinner className="h-4 w-4 text-[#04222a]" />
        ) : (
          <Icon name={icon} filled={active} className="text-xl" />
        )}
      </span>
      {/* Label — fades in when sidebar expands */}
      <span className="whitespace-nowrap pr-3 text-xs font-semibold uppercase tracking-[0.1em] opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
        {label}
      </span>
    </Link>
  );
}

export function DesktopSidebar({ ctx }: { ctx: LoggedInCtx }) {
  return (
    <aside
      className="
        group/sidebar sidebar-glass
        fixed left-0 top-0 z-40 hidden h-screen
        w-[64px] overflow-hidden
        transition-[width] duration-200 ease-in-out
        hover:w-[260px]
        lg:flex lg:flex-col
      "
    >
      <div className="flex h-full flex-col gap-4 py-5">
        {/* Logo / brand — icon always visible, text fades in */}
        <Link
          href="/dashboard"
          className="flex h-11 items-center overflow-hidden px-2.5"
          title={ctx.family?.family_name ?? "Family Hub"}
        >
          <span className="flex h-11 w-9 shrink-0 items-center justify-center">
            <Logo size={36} />
          </span>
          <div className="ml-2 min-w-0 opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            <div className="truncate text-sm font-extrabold tracking-tight text-[#04222a]">
              {ctx.family?.family_name ?? "FamilyHub"}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#04222a]/75">
              Smart Living
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
          {NAV.map((n) => (
            <SidebarLink key={n.href} {...n} />
          ))}
        </nav>

        {/* User card — click to go to profile */}
        <div className="mx-2.5 flex items-center overflow-hidden rounded-xl border border-[#004953]/25 bg-[#004953]/15 p-2 backdrop-blur-md">
          <Link
            href="/profile"
            title="Profil saya"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#004953]/40 bg-[#004953] text-sm font-bold text-white overflow-hidden transition hover:ring-2 hover:ring-[#004953]/40"
          >
            {ctx.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ctx.profile.avatar_url} alt={ctx.profile.full_name} className="h-full w-full object-cover" />
            ) : (
              ctx.profile.full_name.charAt(0).toUpperCase()
            )}
          </Link>
          <Link
            href="/profile"
            className="ml-2 flex-1 overflow-hidden opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100"
          >
            <div className="truncate text-xs font-semibold text-[#04222a] hover:underline">{ctx.profile.full_name}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#04222a]/70">
              {ctx.isAdmin ? "Admin" : "Anggota"}
            </div>
          </Link>
          <form
            action={logoutAction}
            className="ml-1 shrink-0 opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100"
          >
            <SubmitButton
              className="rounded-lg p-1.5 text-[#04222a]/75 transition hover:bg-danger-red/20 hover:text-danger-red"
              pendingLabel=""
            >
              <Icon name="logout" className="text-base" />
            </SubmitButton>
          </form>
        </div>
      </div>
    </aside>
  );
}
