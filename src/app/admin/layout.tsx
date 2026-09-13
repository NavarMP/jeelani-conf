import Link from "next/link";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-navy)] text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold text-lg" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
          <span className="text-[var(--color-brass)] mr-2">✦</span>
          GJC Admin
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/content" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Content Manager
          </Link>
          <Link href="/admin/schedule" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Schedule Builder
          </Link>
          <Link href="/admin/zones" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Zones & Slots
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Registrations</p>
          </div>
          <Link href="/admin/registrations?type=assembly" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Grand Assembly
          </Link>
          <Link href="/admin/registrations?type=darimi" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Darimi Session
          </Link>
          <Link href="/admin/papers" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Paper Review
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Media & Tools</p>
          </div>
          <Link href="/admin/gallery" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Gallery Manager
          </Link>
          <Link href="/admin/live" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Live Stream
          </Link>
          <Link href="/admin/audit" className="block px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
            Audit Trail
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors text-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--color-turquoise)] flex items-center justify-center font-bold">
              A
            </div>
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="font-semibold text-gray-800">Jeelani Conference Administration</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Sept 27, 2026</span>
            <Link href="/" className="text-[var(--color-turquoise)] hover:underline">View Site ↗</Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
