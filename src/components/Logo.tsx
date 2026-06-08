export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="sfh-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5291b3" />
          <stop offset="100%" stopColor="#2f5b78" />
        </linearGradient>
        <linearGradient id="sfh-inner" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3E3D0" />
          <stop offset="100%" stopColor="#D2C4B4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#sfh-grad)" />
      <path
        d="M20 9 L9 19 V31 H17 V24 H23 V31 H31 V19 Z"
        fill="url(#sfh-inner)"
      />
      <circle cx="20" cy="17.5" r="2.2" fill="#2f5b78" />
    </svg>
  );
}

export function LogoWordmark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight text-primary">FamilyHub</span>
        <span className="text-[10px] tracking-[0.18em] font-semibold uppercase text-on-surface-variant">
          Smart Living
        </span>
      </div>
    </div>
  );
}
