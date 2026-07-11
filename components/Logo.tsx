export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      fill="none"
      aria-hidden
      role="img"
    >
      {/* a model bobbing in the shallow end */}
      <circle cx="14" cy="14.6" r="3.9" fill="currentColor" />
      <path
        d="M3 17.4c2.75 0 2.75 1.9 5.5 1.9s2.75-1.9 5.5-1.9 2.75 1.9 5.5 1.9 2.75-1.9 5.5-1.9"
        stroke="var(--waterline)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
