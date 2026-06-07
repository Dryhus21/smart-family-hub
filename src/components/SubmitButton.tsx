"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: React.ReactNode;
  className?: string;
  type?: "submit" | "button";
};

export function SubmitButton({ children, pendingLabel, className, type = "submit" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type={type} className={className} disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          <span>{pendingLabel ?? "Memproses..."}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
