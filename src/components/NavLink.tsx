"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { Spinner } from "./SubmitButton";

function LinkSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className="h-3.5 w-3.5 text-indigo-500" />;
}

export function NavLink({ href, icon, label, className }: { href: string; icon: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      prefetch
      className={
        className ??
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      }
    >
      <span>{icon}</span>
      <span className="flex-1">{label}</span>
      <LinkSpinner />
    </Link>
  );
}

export function NavLinkCompact({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      <span>{icon}</span>
      <span>{label}</span>
      <LinkSpinner />
    </Link>
  );
}
