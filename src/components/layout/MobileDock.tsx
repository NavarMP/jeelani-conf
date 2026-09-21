"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { haptic } from "@/lib/haptics";
import { Building2, CalendarDays, Ticket, Images, Tv, Search } from "lucide-react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

export function MobileDock() {
  const pathname = usePathname();
  const t = useTranslations("MobileDock");
  const { open: openSearch } = useGlobalSearch();

  const dockItems = [
    { href: "/", Icon: Building2, label: t("home"), action: undefined },
    { href: "/#schedule", Icon: CalendarDays, label: t("schedule"), action: undefined },
    { href: "/#register", Icon: Ticket, label: t("register"), action: undefined },
    { href: "/#gallery", Icon: Images, label: t("gallery"), action: undefined },
    { href: "#search", Icon: Search, label: t("search") || "Search", action: openSearch },
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
                : item.href.startsWith("#") ? false : pathname.startsWith(item.href.replace("/#", "/"));

            return item.action ? (
              <button
                key={item.href}
                onClick={() => {
                  haptic("tap");
                  item.action();
                }}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[3rem]"
              >
                <motion.span
                  className="text-[var(--text-primary)]"
                  whileTap={{ scale: 0.8, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                >
                  <item.Icon
                    className="w-5 h-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </motion.span>
                <span className="text-[10px] font-medium transition-colors text-[var(--text-muted)]">
                  {item.label}
                </span>
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => haptic(item.href === "/#register" ? "select" : "tap")}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[3rem]"
              >
                <motion.span
                  className="text-[var(--text-primary)]"
                  whileTap={{ scale: 0.8, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                >
                  <item.Icon
                    className="w-5 h-5"
                    strokeWidth={1.75}
                    color={isActive ? "var(--color-brass)" : undefined}
                    aria-hidden="true"
                  />
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
