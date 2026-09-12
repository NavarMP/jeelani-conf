import type { Metadata } from "next";
import {
  Inter,
  Bodoni_Moda,
  Noto_Sans_Malayalam,
  Noto_Naskh_Arabic,
  Reem_Kufi,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileDock } from "@/components/layout/MobileDock";
import { AmbientAudioPlayer } from "@/components/ui/AmbientAudioPlayer";

/* ── Font Configuration ──────────────────────────────────────────────── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const notoMalayalam = Noto_Sans_Malayalam({
  variable: "--font-noto-sans-malayalam",
  subsets: ["malayalam"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/* ── Metadata ────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Grand Jeelani Conference — From Baghdad to Malabar",
    template: "%s | Grand Jeelani Conference",
  },
  description:
    "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani. Organized by Alathoorpadi Students Association on September 27, at Alathoorpadi, Melmuri. Persian Artistry. Malabar Soul.",
  keywords: [
    "Jeelani Conference",
    "Shaykh Abd al-Qadir al-Jilani",
    "Alathoorpadi",
    "SUFFA Dars",
    "Islamic conference",
    "Melmuri",
    "Baghdad to Malabar",
    "ജീലാനി കോൺഫറൻസ്",
    "مؤتمر الجيلاني",
  ],
  authors: [{ name: "Alathoorpadi Students Association" }],
  openGraph: {
    title: "Grand Jeelani Conference — From Baghdad to Malabar",
    description:
      "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani. September 27, Alathoorpadi, Melmuri.",
    siteName: "Grand Jeelani Conference",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Jeelani Conference",
    description:
      "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ── Theme Script (SSR-safe, prevents FOUC) ──────────────────────────── */
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('gjc-theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

/* ── Root Layout ─────────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    inter.variable,
    bodoniModa.variable,
    notoMalayalam.variable,
    notoArabic.variable,
    reemKufi.variable,
  ].join(" ");

  return (
    <html lang="en" className={`${fontVars} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#103E79" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: "Grand Jeelani Conference",
              description:
                "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani. From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
              startDate: "2026-09-27T10:00:00+05:30",
              endDate: "2026-09-27T22:00:00+05:30",
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode:
                "https://schema.org/MixedEventAttendanceMode",
              location: [
                {
                  "@type": "Place",
                  name: "Alathoorpadi, Melmuri",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Melmuri",
                    addressRegion: "Kerala",
                    addressCountry: "IN",
                  },
                },
                {
                  "@type": "VirtualLocation",
                  url: "https://www.youtube.com/@alathurpadidars",
                },
              ],
              organizer: {
                "@type": "Organization",
                name: "Alathoorpadi Students Association",
                url: "https://alathurpadidars.in",
              },
              image: "https://gjc.alathurpadidars.in/jeelani-dome.png",
              inLanguage: ["en", "ml", "ar"],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileDock />
          <AmbientAudioPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
