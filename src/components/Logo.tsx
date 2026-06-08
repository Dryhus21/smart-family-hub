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
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#2fd9f4" />
        </linearGradient>
        <linearGradient id="sfh-inner" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c0c1ff" />
          <stop offset="100%" stopColor="#ddb7ff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#sfh-grad)" />
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#13131b" fillOpacity="0.35" />
      {/* roof + heart */}
      <path
        d="M20 9 L9 19 V31 H17 V24 H23 V31 H31 V19 Z"
        fill="url(#sfh-inner)"
        opacity="0.95"
      />
      <circle cx="20" cy="17" r="2.2" fill="#13131b" />
    </svg>
  );
}

export function LogoWordmark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-extrabold tracking-tight text-primary text-lg">FamilyHub</span>
        <span className="text-[10px] tracking-[0.18em] font-semibold text-on-surface-variant uppercase">
          Smart Living
        </span>
      </div>
    </div>
  );
}
