import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Dome illustration */}
        <div className="w-32 h-32 mx-auto mb-6 opacity-30">
          <div
            className="w-full h-full bg-[var(--color-navy)] dark:bg-[var(--color-turquoise)]"
            style={{
              WebkitMaskImage: "url('/motifs/jeelani-dome-stroke.svg')",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskImage: "url('/motifs/jeelani-dome-stroke.svg')",
              maskSize: "contain",
              maskPosition: "center",
              maskRepeat: "no-repeat",
            }}
            aria-hidden="true"
          />
        </div>

        <h1
          className="text-5xl font-bold text-[var(--color-brass)] mb-3"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("title")}
        </h1>
        <h2
          className="text-xl font-semibold text-[var(--text-primary)] mb-2"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("heading")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {t("description")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all"
          >
            {t("returnHome")}
          </Link>
          <Link
            href="/#schedule"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
          >
            {t("viewSchedule")}
          </Link>
        </div>
      </div>
    </div>
  );
}
