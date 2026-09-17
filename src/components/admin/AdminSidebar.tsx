"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  GraduationCap,
  Zap,
  CalendarRange,
  Mic,
  Armchair,
  Radio,
  Images,
  PenLine,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navSections: { title: string; items: { label: string; href: string; Icon: LucideIcon; exact?: boolean; isAllRegs?: boolean; type?: string }[] }[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", Icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "Registrations & Entries",
      items: [
        { label: "All Registrations", href: "/admin/registrations", Icon: ClipboardList, isAllRegs: true },
        { label: "Grand Assembly", href: "/admin/registrations?type=assembly", Icon: Building2, type: "assembly" },
        { label: "Astronomy & AI Fiqh", href: "/admin/registrations?type=astro-ai-fiqh", Icon: GraduationCap, type: "darimi" },
        { label: "Dynamic Sessions", href: "/admin/sessions", Icon: Zap, exact: true },
      ],
    },
    {
      title: "Program & Venue",
      items: [
        { label: "Schedule Builder", href: "/admin/schedule", Icon: CalendarRange, exact: true },
        { label: "Guests", href: "/admin/guests", Icon: Mic, exact: true },
        { label: "Zones & Slots", href: "/admin/zones", Icon: Armchair, exact: true },
      ],
    },
    {
      title: "Media & Broadcast",
      items: [
        { label: "Live Stream Control", href: "/admin/live", Icon: Radio, exact: true },
        { label: "Gallery Manager", href: "/admin/gallery", Icon: Images, exact: true },
      ],
    },
    {
      title: "Administration",
      items: [
        { label: "Content Manager", href: "/admin/content", Icon: PenLine, exact: true },
        { label: "System Audit Trail", href: "/admin/audit", Icon: ShieldCheck, exact: true },
      ],
    },
  ];

  const isLinkActive = (item: any) => {
    if (item.type) {
      return pathname.includes("/admin/registrations") && currentType === item.type;
    }
    if (item.isAllRegs) {
      return pathname.includes("/admin/registrations") && !currentType;
    }
    if (item.exact) {
      return pathname.endsWith(item.href);
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-[var(--color-navy)] text-white shadow-md focus:outline-none"
        >
          {isMobileOpen ? <X className="w-4 h-4" strokeWidth={2} /> : <Menu className="w-4 h-4" strokeWidth={2} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[var(--color-navy)] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Header */}
        <div
          className="h-16 flex items-center justify-between px-6 border-b border-white/10 font-bold text-lg"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          <div className="flex items-center">
            <span className="text-[var(--color-brass)] mr-2.5">✦</span>
            <span>GJC Admin</span>
          </div>
          <span className="text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
            2026
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">
                {sec.title}
              </p>
              {sec.items.map((item, iIdx) => {
                const active = isLinkActive(item);
                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? "bg-white/15 text-white font-semibold shadow-xs ring-1 ring-white/20"
                        : "text-white/75 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <item.Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / User & Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-xs text-white/80 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-turquoise)] flex items-center justify-center font-bold text-white text-xs">
                A
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Administrator</div>
                <div className="text-[10px] text-white/50">admin@jeelani.org</div>
              </div>
            </div>
            <span className="text-white/40 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
