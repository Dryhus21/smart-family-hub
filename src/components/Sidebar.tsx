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
          ? "border-r-4 border-primary-strong bg-primary-strong/15 text-primary"
          : "text-on-surface-variant hover:bg-white/50 hover:text-primary"
      }`}
    >
      {/* Icon — fixed 44px column so it stays centered when collapsed */}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        {pending ? (
          <Spinner className="h-4 w-4 text-primary-strong" />
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
        group/sidebar
        fixed left-0 top-0 z-40 hidden h-screen
        w-[64px] overflow-hidden
        border-r border-white/40 bg-glass-bg-strong
        shadow-[8px_0_30px_-12px_rgba(47,91,120,0.2)]
        backdrop-blur-xl
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
            <div className="truncate text-sm font-extrabold tracking-tight text-primary">
              {ctx.family?.family_name ?? "FamilyHub"}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              Family Hub
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
          {NAV.map((n) => (
            <SidebarLink key={n.href} {...n} />
          ))}
        </nav>

        {/* User card */}
        <div className="mx-2.5 flex items-center overflow-hidden rounded-xl border border-white/70 bg-white/70 p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary-strong text-sm font-bold text-on-primary">
            {ctx.profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2 flex-1 overflow-hidden opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            <div className="truncate text-xs font-semibold text-on-surface">{ctx.profile.full_name}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              {ctx.isAdmin ? "Admin" : "Anggota"}
            </div>
          </div>
          <form
            action={logoutAction}
            className="ml-1 shrink-0 opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100"
          >
            <SubmitButton
              className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-danger-red/10 hover:text-danger-red"
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
