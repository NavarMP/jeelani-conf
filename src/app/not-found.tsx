import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Dome illustration */}
        <div className="w-32 h-32 mx-auto mb-6 text-[var(--color-navy)] dark:text-[var(--color-turquoise)] opacity-30">
          <svg viewBox="0 0 200 180" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
            <path d="M30 140 Q30 60 100 20 Q170 60 170 140"/>
            <rect x="25" y="140" width="150" height="25" rx="2"/>
            <path d="M40 165 Q50 150 60 165"/>
            <path d="M65 165 Q75 150 85 165"/>
            <path d="M90 165 Q100 150 110 165"/>
            <path d="M115 165 Q125 150 135 165"/>
            <path d="M140 165 Q150 150 160 165"/>
            <line x1="100" y1="20" x2="100" y2="8"/>
            <circle cx="100" cy="6" r="3"/>
          </svg>
        </div>

        <h1
          className="text-5xl font-bold text-[var(--color-brass)] mb-3"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          404
        </h1>
        <h2
          className="text-xl font-semibold text-[var(--text-primary)] mb-2"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          Page Not Found
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          The path you seek leads beyond our walls. Perhaps try navigating back to the main gathering.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all"
          >
            ← Return Home
          </Link>
          <Link
            href="/#schedule"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
