import { Metadata } from "next";
import { constructOgImageUrl } from "@/lib/og-utils";

export const metadata: Metadata = {
  title: "Register: Astro AI Fiqh",
  description: "Register for the Astro AI Fiqh academic session.",
  openGraph: {
    title: "Register: Astro AI Fiqh",
    description: "Register for the Astro AI Fiqh academic session.",
    images: [
      {
        url: constructOgImageUrl("register", {
          title: "Astro AI Fiqh",
          desc: "Join the academic session",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register: Astro AI Fiqh",
    description: "Register for the Astro AI Fiqh academic session.",
    images: [
      constructOgImageUrl("register", {
        title: "Astro AI Fiqh",
        desc: "Join the academic session",
      }),
    ],
  },
};

export default function AstroAIFiqhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
