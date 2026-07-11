export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      fill="none"
      aria-hidden
      role="img"
    >
      {/* pool wall */}
      <rect x="1.5" y="1.5" width="25" height="25" rx="7" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      {/* a model bobbing in the shallow end */}
      <circle cx="14" cy="14.8" r="3.3" fill="currentColor" />
      <path
        d="M4.5 17.5c2.375 0 2.375 1.7 4.75 1.7s2.375-1.7 4.75-1.7 2.375 1.7 4.75 1.7 2.375-1.7 4.75-1.7"
        stroke="var(--waterline)"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
