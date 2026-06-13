export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#4b82bb" />
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#78A2D2" fillOpacity="0.6" />
      <path d="M20 9 L9 19 V31 H17 V24 H23 V31 H31 V19 Z" fill="#FEFFAF" />
      <circle cx="20" cy="17.5" r="2.2" fill="#1e3f62" />
    </svg>
  );
}

export function LogoWordmark({ size = 32, variant = "auto" }: { size?: number; variant?: "auto" | "light" | "dark" }) {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="flex flex-col leading-tight">
        <span
          className={`text-lg font-extrabold tracking-tight ${
            isLight ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" : "text-primary"
          }`}
        >
          FamilyHub
        </span>
        <span
          className={`text-[10px] tracking-[0.18em] font-semibold uppercase ${
            isLight ? "text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" : "text-on-surface"
          }`}
        >
          Smart Living
        </span>
      </div>
    </div>
  );
}
