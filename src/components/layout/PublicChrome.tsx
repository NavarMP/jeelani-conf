"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MobileDock } from "@/components/layout/MobileDock";
import { AmbientAudioPlayer } from "@/components/ui/AmbientAudioPlayer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AIAgent } from "@/components/ui/AIAgent";
import { SearchProvider, type SearchDataPayload } from "@/components/providers/SearchProvider";

/**
 * PublicChrome wraps all public-website-only UI (Navbar, Footer, MobileDock,
 * CustomCursor, AmbientAudioPlayer, AIAgent). It is hidden on admin routes so the
 * admin panel gets its own independent layout.
 */
export function PublicChrome({
  children,
  footer,
  searchData,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  searchData: SearchDataPayload;
}) {
  const pathname = usePathname();
  const isStandalone = pathname.includes("/admin") || pathname.includes("/scanner") || pathname.includes("/badge");

  if (isStandalone) {
    // Admin, standalone scanner, and badge routes: render children only — no public chrome
    return <>{children}</>;
  }

  // Public routes: full site chrome
  return (
    <SearchProvider data={searchData}>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer}
      <MobileDock />
      <AmbientAudioPlayer />
      <AIAgent />
    </SearchProvider>
  );
}

