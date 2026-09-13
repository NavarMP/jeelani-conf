"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function MobileDock() {
  const pathname = usePathname();
  const t = useTranslations("MobileDock");

  const dockItems = [
    { href: "/", icon: "🕌", label: t("home") },
    { href: "/#schedule", icon: "📅", label: t("schedule") },
    { href: "/#register", icon: "🎫", label: t("register") },
    { href: "/#gallery", icon: "🖼", label: t("gallery") },
    { href: "/live", icon: "📺", label: t("live") },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <nav
        className="mx-3 mb-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl shadow-lg"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2 px-1">
          {dockItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.replace("/#", "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[3rem]"
              >
                <motion.span
                  className="text-xl"
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {item.icon}
                </motion.span>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-[var(--color-brass)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="dock-indicator"
                    className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-[var(--color-brass)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
