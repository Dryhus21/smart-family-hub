"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Spinner } from "./SubmitButton";

function LinkSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className="h-3.5 w-3.5 text-primary" />;
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
          ? "flex items-center gap-4 rounded-lg border-r-4 border-primary bg-primary-container/20 px-4 py-3 text-primary transition-colors"
          : "flex items-center gap-4 rounded-lg px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-bright/40 hover:text-on-surface"
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

  if (active) {
    return (
      <Link
        href={href}
        prefetch
        className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-primary text-on-primary transition-transform active:scale-90"
      >
        <Icon name={icon} filled className="text-xl" />
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide">{label}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      prefetch
      className="flex h-12 w-12 flex-col items-center justify-center text-on-surface-variant transition hover:text-primary"
    >
      <Icon name={icon} className="text-xl" />
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">{label}</span>
    </Link>
  );
}
