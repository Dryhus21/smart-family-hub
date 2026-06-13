"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Spinner } from "./SubmitButton";

function LinkSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className="h-3.5 w-3.5 text-primary-strong" />;
}

export function NavSidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch
      className={
        active
          ? "flex items-center gap-4 rounded-lg border-r-4 border-primary-strong bg-primary-strong/15 px-4 py-3 text-primary transition-colors"
          : "flex items-center gap-4 rounded-lg px-4 py-3 text-on-surface-variant transition-colors hover:bg-white/50 hover:text-primary"
      }
    >
      <Icon name={icon} filled={active} className="text-xl" />
      <span className="flex-1 text-xs font-semibold uppercase tracking-[0.1em]">{label}</span>
      <LinkSpinner />
    </Link>
  );
}

export function NavBottomLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch
      className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition active:scale-95 ${
        active
          ? "bg-primary-strong/15 text-primary"
          : "text-on-surface-variant hover:text-primary"
      }`}
    >
      <Icon name={icon} filled={active} className="text-lg" />
      <span className="text-[8.5px] font-semibold uppercase tracking-wide leading-none truncate w-full text-center">
        {label}
      </span>
    </Link>
  );
}
