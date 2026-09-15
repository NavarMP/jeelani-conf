import Link from "next/link";
import React, { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dynamic, interactive Sidebar with active states */}
      <Suspense fallback={<div className="w-64 bg-[var(--color-navy)]" />}>
        <AdminSidebar />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 shrink-0 pl-16 lg:pl-8">
          <div>
            <h1 className="font-bold text-gray-900 text-sm sm:text-base">
              Jeelani Conference Administration
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Grand Assembly & Darimi Session Control Center
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
            <span className="hidden sm:inline-block px-2.5 py-1 bg-gray-100 rounded-full font-mono text-xs">
              Sept 27, 2026
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-[var(--color-navy)] font-medium hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <span>View Site</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/70">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
