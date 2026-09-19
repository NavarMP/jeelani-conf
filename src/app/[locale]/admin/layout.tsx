"use client";

import React, { useState, Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--admin-bg)]">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-64 bg-[var(--color-navy)] shrink-0 hidden lg:block" />}>
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
