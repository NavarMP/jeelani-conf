import type { Metadata } from "next";
import {
  Noto_Serif_Malayalam,
  Noto_Naskh_Arabic,
  Reem_Kufi,
} from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

/* ── Font Configuration ──────────────────────────────────────────────────
   General Sans is used across the entire app for body text, headings,
   and titles — providing a crisp, modern, premium aesthetic (similar to
   Google Sans). Both `--font-sans` and `--font-bodoni-moda` are bound to
   General Sans so legacy heading references instantly adopt it.
   ── ────────────────────────────────────────────────────────────────── */
const generalSans = localFont({
  src: [
    {
      path: "../../../public/fonts/GeneralSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../../public/fonts/GeneralSans-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const display = localFont({
  src: [
    {
      path: "../../../public/fonts/GeneralSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../../public/fonts/GeneralSans-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const malayalamText = Noto_Serif_Malayalam({
  variable: "--font-malayalam-text",
  subsets: ["malayalam"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const malayalamTitle = localFont({
  src: "../../../public/fonts/FCMakam-Regular.ttf",
  variable: "--font-malayalam-title",
  weight: "400",
  display: "swap",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Grand Jeelani Conference — From Baghdad to Malabar",
    template: "%s | Grand Jeelani Conference",
  },
  description:
    "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani. Organized by Alathurpadi Students Association on September 27, at Alathurpadi, Melmuri. Persian Artistry. Malabar Soul.",
  keywords: [
    "Jeelani Conference",
    "Shaykh Abd al-Qadir al-Jilani",
    "Alathurpadi",
    "SUFFA Dars",
    "Islamic conference",
    "Melmuri",
    "Baghdad to Malabar",
    "ജീലാനി കോൺഫറൻസ്",
    "مؤتمر الجيلاني",
  ],
  authors: [{ name: "Alathurpadi Students Association" }],
  openGraph: {
    title: "Grand Jeelani Conference — From Baghdad to Malabar",
    description:
      "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani. September 27, Alathurpadi, Melmuri.",
    siteName: "Grand Jeelani Conference",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/api/og?type=default",
        width: 1200,
        height: 630,
        alt: "Grand Jeelani Conference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Jeelani Conference",
    description:
      "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
    images: ["/api/og?type=default"],
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

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { getSessions, getSpeakers, getRegistrationSessions, getPublishedGalleryMedia, getSiteSettings } from '@/lib/data';
import { LenisProvider } from "@/components/providers/LenisProvider";

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  if (!locales.includes(locale as any)) notFound();

  setRequestLocale(locale);

  // Fetch search data
  const [sessions, speakers, registrationSessions, galleryMedia, siteSettings, messages] = await Promise.all([
    getSessions(),
    getSpeakers(),
    getRegistrationSessions(),
    getPublishedGalleryMedia(),
    getSiteSettings(),
    getMessages(),
  ]);

  const searchData = {
    sessions,
    speakers,
    registrationSessions,
    galleryMedia,
    siteSettings,
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const fontVars = [
    generalSans.variable,
    display.variable,
    malayalamText.variable,
    malayalamTitle.variable,
    notoArabic.variable,
    reemKufi.variable,
  ].join(" ");

  return (
    <html lang={locale} dir={dir} className={cn("h-full", "antialiased", fontVars, "font-sans")} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
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
                  name: "Alathurpadi, Melmuri",
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
                name: "Alathurpadi Students Association",
                url: "https://alathurpadidars.in",
              },
              image: "https://gjc.alathurpadidars.in/jeelani-dome.png",
              inLanguage: ["en", "ml", "ar"],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <LenisProvider>
              <PublicChrome footer={<Footer />} searchData={searchData}>{children}</PublicChrome>
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
