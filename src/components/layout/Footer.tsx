import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { Globe, Mail } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube, FaXTwitter, FaWhatsapp } from "react-icons/fa6";

export async function Footer() {
  const siteSettings = await getSiteSettings();
  const t = await getTranslations("Footer");

  const socialLinks = [
    { href: siteSettings.social?.website || "", label: "Website", Icon: Globe },
    { href: `mailto:${siteSettings.social?.email || ""}`, label: "Email", Icon: Mail },
    { href: siteSettings.social?.whatsappDirect || "", label: "WhatsApp", Icon: FaWhatsapp },
    { href: siteSettings.social?.whatsappChannel || "", label: "WhatsApp Channel", Icon: FaWhatsapp },
    { href: siteSettings.social?.instagram || "", label: "Instagram", Icon: FaInstagram },
    { href: siteSettings.social?.facebook || "", label: "Facebook", Icon: FaFacebookF },
    { href: siteSettings.social?.twitter || "", label: "X (Twitter)", Icon: FaXTwitter },
    { href: siteSettings.social?.youtube || "", label: "YouTube", Icon: FaYoutube },
  ].filter((link) => link.href);
  return (
    <footer className="bg-[var(--color-black)] text-[var(--color-ivory)] relative overflow-hidden">
      {/* Subtle arabesque pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 py-16 md:py-20">
        {/* Tagline statement */}
        <div className="text-center mb-12">
          <p className="text-[var(--color-brass)] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            ✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦
          </p>
          <h3
            className="text-2xl md:text-3xl font-bold text-[var(--color-ivory)] mb-2"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("tagline")}
          </h3>
          <p className="text-[var(--color-ivory)]/60 text-sm mt-4">
            {t("subtitle")}
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Organizer */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/adsa-logo.png" alt="ADSA Logo" width={40} height={40} className="rounded" />
              <div>
                <p className="font-semibold text-sm">{t("organizedBy")}</p>
                <p className="text-[var(--color-brass)] text-sm">{t("organizerName")}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ivory)]/50 leading-relaxed">
              {t("organizerDesc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--color-turquoise)]">{t("quickLinks")}</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/#about", label: t("about") },
                { href: "/#schedule", label: t("schedule") },
                { href: "/#speakers", label: t("speakers") },
                { href: "/#gallery", label: t("gallery") },
                { href: "/live", label: t("watchLive") },
                { href: "/#location", label: t("location") },
                { href: "/#register", label: t("register") },
                { href: "/#countdown", label: t("eventDate") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--color-ivory)]/60 hover:text-[var(--color-brass)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--color-turquoise)]">{t("connect")}</h4>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-[var(--color-turquoise)]/20 text-[var(--color-ivory)]/70 hover:text-[var(--color-ivory)] transition-all border border-white/5 hover:border-[var(--color-turquoise)]/30"
                  title={link.label}
                >
                  <link.Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--color-ivory)]/40">
          <p>© {new Date().getFullYear()} {t("copyright")}</p>
          <p className="text-[var(--color-brass)]/50">
            {t("bottomTagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
