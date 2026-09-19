"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MobileDock } from "@/components/layout/MobileDock";
import { AmbientAudioPlayer } from "@/components/ui/AmbientAudioPlayer";
import { CustomCursor } from "@/components/ui/CustomCursor";

/**
 * PublicChrome wraps all public-website-only UI (Navbar, Footer, MobileDock,
 * CustomCursor, AmbientAudioPlayer). It is hidden on admin routes so the
 * admin panel gets its own independent layout.
 */
export function PublicChrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");

  if (isAdmin) {
    // Admin routes: render children only — no public chrome
    return <>{children}</>;
  }

  // Public routes: full site chrome
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer}
      <MobileDock />
      <AmbientAudioPlayer />
    </>
  );
}
