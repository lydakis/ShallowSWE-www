export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      fill="none"
      aria-hidden
      role="img"
    >
      {/* pool wall / gauge */}
      <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.4" />
      {/* waterline */}
      <path d="M4 10.5c2.6 0 2.6 1.8 5.2 1.8s2.6-1.8 5.2-1.8 2.6 1.8 5.2 1.8 2.6-1.8 4.2-1.8" stroke="var(--waterline)" strokeWidth="1.8" strokeLinecap="round" />
      {/* a model floating near the surface, and one that sank */}
      <circle cx="9" cy="16" r="1.7" fill="var(--waterline)" />
      <circle cx="18.5" cy="21" r="1.7" fill="currentColor" fillOpacity="0.45" />
      <line x1="18.5" y1="12.4" x2="18.5" y2="19.3" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="1.4 1.8" />
    </svg>
  );
}
