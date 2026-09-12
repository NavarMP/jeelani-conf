import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/lib/data";

const socialLinks = [
  { href: siteSettings.social.website, label: "Website", icon: "🌐" },
  { href: `mailto:${siteSettings.social.email}`, label: "Email", icon: "✉" },
  { href: siteSettings.social.whatsappDirect, label: "WhatsApp", icon: "💬" },
  { href: siteSettings.social.whatsappChannel, label: "WhatsApp Channel", icon: "📢" },
  { href: siteSettings.social.instagram, label: "Instagram", icon: "📷" },
  { href: siteSettings.social.facebook, label: "Facebook", icon: "📘" },
  { href: siteSettings.social.twitter, label: "X (Twitter)", icon: "𝕏" },
  { href: siteSettings.social.youtube, label: "YouTube", icon: "▶" },
];

export function Footer() {
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
            People. Ideas. Heritage. A Brighter Tomorrow.
          </h3>
          <p className="text-[var(--color-ivory)]/60 text-sm mt-4">
            Exploring the spiritual geometry that connects the sands of Persia to the shores of Malabar
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Organizer */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/adsa-logo.png" alt="ADSA Logo" width={40} height={40} className="rounded" />
              <div>
                <p className="font-semibold text-sm">Organized by</p>
                <p className="text-[var(--color-brass)] text-sm">Alathoorpadi Students Association</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ivory)]/50 leading-relaxed">
              A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--color-turquoise)]">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/#about", label: "About" },
                { href: "/#schedule", label: "Schedule" },
                { href: "/#speakers", label: "Speakers" },
                { href: "/#gallery", label: "Gallery" },
                { href: "/live", label: "Watch Live" },
                { href: "/#location", label: "Location" },
                { href: "/#register", label: "Register" },
                { href: "/#countdown", label: "Event Date" },
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
            <h4 className="font-semibold text-sm mb-4 text-[var(--color-turquoise)]">Connect</h4>
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
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--color-ivory)]/40">
          <p>© {new Date().getFullYear()} Grand Jeelani Conference. All rights reserved.</p>
          <p className="text-[var(--color-brass)]/50">
            From Baghdad to Malabar — Persian Artistry. Malabar Soul.
          </p>
        </div>
      </div>
    </footer>
  );
}
