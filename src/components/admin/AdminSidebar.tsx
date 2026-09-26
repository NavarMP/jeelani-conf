"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  GraduationCap,
  Zap,
  CalendarRange,
  Mic,
  Radio,
  Images,
  PenLine,
  ShieldCheck,
  MessageSquare,
  X,
  LogOut,
  ScanLine,
  UserCheck,
  Trophy,
  Users,
  Megaphone,
  UserPlus,
  LifeBuoy,
  MapPin,
  type LucideIcon,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");
  const router = useRouter();

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
        { label: "Phase Control", href: "/admin/phases", Icon: Zap, exact: true },
        { label: "Event Intelligence", href: "/admin/analytics", Icon: BarChart3, exact: true },
        { label: "System Telemetry", href: "/admin/telemetry", Icon: Zap, exact: true },
      ],
    },
    {
      title: "Event Day",
      items: [
        { label: "Live Attendance", href: "/admin/attendance", Icon: UserCheck, exact: true },
        { label: "QR Scanner", href: "/admin/scanner", Icon: ScanLine, exact: true },
        { label: "Spot Registration", href: "/admin/spot-registration", Icon: UserPlus, exact: true },
        { label: "Help Desk", href: "/admin/helpdesk", Icon: LifeBuoy, exact: true },
        { label: "Competition", href: "/admin/competition", Icon: Trophy, exact: true },
        { label: "Staff & Volunteers", href: "/admin/staff", Icon: Users, exact: true },
        { label: "Announcements", href: "/admin/announcements", Icon: Megaphone, exact: true },
      ],
    },
    {
      title: "Registrations & Entries",
      items: [
        { label: "All Registrations", href: "/admin/registrations", Icon: ClipboardList, isAllRegs: true },
        { label: "Astronomy & AI Fiqh", href: "/admin/registrations?type=astro-ai-fiqh", Icon: GraduationCap, type: "astro-ai-fiqh" },
        { label: "Burda & Qawwali", href: "/admin/registrations?type=burda-qawwali", Icon: Zap, type: "burda-qawwali" },
        { label: "Dynamic Sessions", href: "/admin/sessions", Icon: Zap, exact: true },
      ],
    },
    {
      title: "Program & Venue",
      items: [
        { label: "Schedule Builder", href: "/admin/schedule", Icon: CalendarRange, exact: true },
        { label: "Stage Management", href: "/admin/stages", Icon: MapPin, exact: true },
        { label: "Guests", href: "/admin/guests", Icon: Mic, exact: true },
      ],
    },
    {
      title: "Interactive Quiz",
      items: [
        { label: "Quiz Overview", href: "/admin/quiz", Icon: LayoutDashboard, exact: true },
        { label: "Locations & QR", href: "/admin/quiz/locations", Icon: ScanLine, exact: true },
        { label: "Questions Bank", href: "/admin/quiz/questions", Icon: ClipboardList, exact: true },
        { label: "Live Entries", href: "/admin/quiz/entries", Icon: Users, exact: true },
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
        { label: "Feedback", href: "/admin/feedback", Icon: MessageSquare, exact: true },
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
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[var(--color-navy)] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Header */}
        <div
          className="h-14 flex items-center justify-between px-5 border-b border-white/10 font-bold text-base"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          <div className="flex items-center">
            <span className="text-[var(--color-brass)] mr-2">✦</span>
            <span>GJC Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
              2026
            </span>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
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
                    onClick={onClose}
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
