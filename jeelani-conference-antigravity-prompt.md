# AGENT BUILD BRIEF — "Grand Jeelani Conference" Web Application

> **Target agent:** Google Antigravity
> **Mission type:** Full-stack, production-grade web application build
> **Stack:** Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, Storage, Realtime) + Razorpay
> **Tone of this document:** Treat every section as a hard requirement unless marked "optional." Ask no clarifying questions that can be reasonably resolved by re-reading this brief — make a sensible decision, document it in a `DECISIONS.md` file at the repo root, and continue.

---

## 0. MISSION STATEMENT

Build **gjc.alathurpadidars.in** (working name), the official web application for the **Grand Jeelani Conference** — a commemorative, academic, and spiritual event organized by the **Alathoorpadi Students Association** (SUFFA Dars) on **Sunday, September 27**, at **Alathoorpadi, Melmuri**, honoring the 12th-century Sufi scholar **Shaykh Abd al-Qadir al-Jilani**.

The event's creative platform is titled **"From Baghdad to Malabar — Persian Artistry. Malabar Soul."** — a dialogue between global Islamic heritage (Ottoman/Persian arabesque tilework from Shaykh Jilani's shrine in Baghdad) and local Malabar Dars tradition. The web app must **visually and emotionally embody this dialogue**: sacred, dignified, ornamental, but rendered through a modern, award-winning, high-motion web experience — not a static devotional flyer.

The bar to hit: this should feel like something that could be shortlisted on **Awwwards / FWA / CSS Design Awards** — best-in-class motion, typography, and interaction craft — while remaining fast, accessible, and legible to a broad multigenerational, multilingual (English / Malayalam / Arabic) audience, including elderly attendees checking event timings on a mid-range Android phone.

---

## 1. SOURCE MATERIAL — THEME BOOK ANALYSIS (authoritative design system)

The agent has been given the official **"Grand Jeelani Conference — Event Identity & Experience Proposal"** theme book. Extract and implement the following design system **exactly** as the visual foundation. Do not invent a different palette or typographic direction — extend this system, don't replace it.

### 1.1 Color System
Build this as CSS custom properties / a Tailwind theme extension, with the stated visual-balance weights guiding how much of each color appears in any given viewport (i.e., navy and ivory should dominate; brass and rose are accents, never backgrounds).

| Token name | Hex | Role | Visual balance |
|---|---|---|---|
| `--color-ivory` (Manuscript Ivory) | `#F8F5EF` | Primary background / negative space | 15% |
| `--color-navy` (Jeelani Navy) | `#103E79` | Primary brand color, headers, CTAs, dome-inspired | **40%** |
| `--color-turquoise` (Tile Turquoise) | `#218EB6` | Secondary accent, tilework motifs, links/hover | 10% |
| `--color-brass` (Lamp Brass) | `#FFC800` | Highlight accent, badges, "live" indicators, sparkle/glint details | 5% |
| `--color-rose` (Garden Rose) | `#BA6473` | Tertiary accent, floral motifs, delegate badge accent | 10% |
| `--color-black` (Spiritual Black) | `#2B2A29` | Deep sections, logotype plate, footer, dark-mode base | 20% |

Build a full **light** and **dark** theme from these tokens (see §5.2 for theme provider behavior):
- **Light mode:** Ivory base, Navy text/headers, Turquoise/Brass/Rose as accents — matches the theme book directly.
- **Dark mode:** Spiritual Black / near-black base, Ivory text, Navy elevated surfaces, Turquoise/Brass glow accents (brass especially should feel like lamplight in dark mode — subtle glow/bloom on hover states, CTA buttons, and the countdown timer).
- **System default:** the app must default to `system` and respect `prefers-color-scheme`, with light/dark as explicit overrides. Persist the user's explicit choice (localStorage), but "system" should stay live-reactive to OS changes when selected.

### 1.2 Typography
The theme book uses a **display script/serif "stamp" wordmark** ("Grand **Jeelani** Conference") — a confident calligraphic-serif hybrid — set against a **black scalloped postage-stamp badge** shape. Malayalam ("ജീലാനി കോൺഫറൻസ്") and Arabic ("مؤتمر الجيلاني") wordmarks are rendered in the same badge treatment with their own display type.

Implement:
- **Display/headline font:** A high-quality calligraphic serif/script webfont (e.g., a licensed font in the spirit of the "Grand Jeelani" mark — evaluate `Playfair Display` + a script pairing, or source a closer match such as `Bodoni Moda`/`Fraunces` for structure paired with a script accent for the word "Jeelani" itself). If exact-matching the theme book's custom lettering isn't feasible with a webfont, recreate the wordmark as a **locked SVG logo asset** (see §1.4) rather than approximating badly with body text.
- **Body/UI font (Latin):** A clean, highly legible modern sans (e.g., `Inter`, `General Sans`, or `Satoshi`) for all UI chrome, forms, and long-form body copy — the ornamentation lives in the *decoration*, not the *readability layer*.
- **Malayalam font stack:** A proper, modern Malayalam typeface with good screen rendering (e.g., `Noto Sans Malayalam` / `Manjari` / `Baloo Chettan 2` for display weight) — never fall back to a generic system font that mangles conjuncts.
- **Arabic font stack:** A refined Naskh or Kufi-adjacent typeface appropriate for Sufi/Islamic scholarly content (e.g., `Noto Naskh Arabic` / `Amiri` for body, `Reem Kufi` or similar for display), with correct RTL shaping.
- Type scale: build a fluid type scale using `clamp()` so headline sizes scale smoothly from mobile to ultra-wide, not just at breakpoints.

### 1.3 The Signature Pattern System ("Event Pattern")
The theme book defines a **Turquoise Ottoman Arabesque tile pattern** (interlocking diamonds/finials in turquoise/navy/brass/deep red on white) and a companion **pointed-arch mihrab border pattern** (cobalt blue field, gold/white floral medallions inside repeated pointed arches, framed by ornamental borders). These read as: *"a living tradition traveling through generations."*

Implement these as:
- Reusable **SVG/CSS pattern components** (`<ArabesqueTile />`, `<MihrabArchBorder />`) that can tile infinitely and be recolored via CSS variables (so they adapt between light/dark themes without needing separate art files).
- Used as **section dividers, background textures at low opacity (5–10%) behind hero/about copy**, border treatments on cards (session cards, speaker cards), and loading-state skeletons — never as a busy full-opacity background behind body text.
- Respect performance: patterns should be optimized SVG (not large rasters), lazy-decorative (`aria-hidden="true"`), and reduced/simplified on `prefers-reduced-motion` and low-end devices.

### 1.4 Graphic Vocabulary (motif library)
The theme book names a specific set of reusable motifs — build each as a small, optimized, tintable SVG component library under `/components/motifs/`:
1. **Tile Repeat (Stroke)** — outline-only arabesque tile, for subtle borders/dividers.
2. **Tile Repeat (Fill)** — solid-color version, for badges/tags.
3. **The Four-Point Glint** — a small sparkle/star accent (already visible flanking "Jeelani" in the wordmark) — use sparingly as a micro-interaction (e.g., appears on hover/focus of key CTAs, or animates in on scroll-reveal of headline text).
4. **The Ponnani Hanging Lamp** — an ornamental mosque lamp silhouette — use as an icon for "Sessions," "Schedule," or a loading spinner (subtle swinging animation on load).
5. **Jeelani Dome Arabesque (Stroke + Filled Color variants)** — the blue-domed shrine motif from the cover — hero background element, About section illustration, favicon/app-icon basis.
6. **The Scalloped Seal** — the postage-stamp scalloped-edge badge shape used for the wordmark lockup — reuse as a **shape mask** for speaker photo frames, badge/ID card previews, and "Save the Date" / social-share card templates.
7. **Baghdad Rose Ogee Arabesque** — a rose-accented ogee/paisley motif — use in the About/heritage narrative section and possibly as a subtle pattern in the footer.

### 1.5 Spatial / Stage Concept → translate to UI metaphor
The theme book's physical stage design principles should inform the **digital "stage" metaphor** for session/live-stream pages:
1. **A clear focal point** → On session detail and live-stream pages, the video/content is always the dominant visual element; UI chrome recedes.
2. **Familiar materials** → Use a subtle mashrabiya lattice-pattern (geometric wood-lattice look) as a decorative side-panel treatment on wide desktop layouts (framing content like the physical stage wings), rendered in CSS/SVG, not literal wood texture.
3. **Layered lighting** → In dark mode, use warm amber/brass glow (2700–3000K-equivalent warm tone) for ambient section backgrounds and highlight states, contrasted with cooler navy/turquoise for structural elements — mirroring the stage lighting brief.
4. **Symmetrical architecture** → Favor centered, symmetrical hero and section compositions with balanced dual accents (mirroring the "dual decorative towers"), especially on the hero and schedule overview.

### 1.6 Print & Keepsake Assets → in-app equivalents
The theme book shows delegate/speaker/organizer ID badges (color-coded: Delegate = Rose/Red, Speaker = Turquoise, Organizer = Brass/Yellow, all on the black scalloped-seal card with dome photo) and navy lanyards with gold stars. Recreate these as:
- **Digital badge/ticket component** generated after successful registration (see §6), styled exactly like the print badge (scalloped card, role-colored footer band, dome image, name, role, session tag, QR code for check-in), downloadable as an image/PDF and shareable to WhatsApp/social.
- Use the "People / Ideas / Heritage / A Brighter Tomorrow" tagline treatment (white text on black, gold sparkle) as a closing/footer statement or social-share card template.

---

## 2. INFORMATION ARCHITECTURE / SITE MAP

```
/                          → Home (single-page scroll experience with anchored sections)
  ├─ Hero
  ├─ About / Central Idea
  ├─ Countdown + Add to Calendar
  ├─ Program Schedule (interactive, dual-stage)
  ├─ Sessions overview (cards → link to detail pages)
  ├─ Guests & Speakers
  ├─ Registration/Booking CTA block
  ├─ Gallery preview + "View full gallery"
  ├─ Live Stream preview (when live)
  ├─ Location / Directions
  └─ Footer (social, contact, credits)

/sessions/[slug]           → Detail page per session (see §6 schedule data)
/register/grand-assembly   → Private-link-only registration + seat/slot map (SUFFA dars students)
/register/musthafa-darimi  → Public paid registration (Razorpay) — session + follow-on course
/register/paper-presentation → Public free registration
/schedule                  → Full interactive schedule (both stages, filterable, downloadable brochure)
/gallery                   → Full photo/video/highlights/poster gallery
/speakers                  → All guests/speakers grid + individual bios
/speakers/[slug]           → Individual speaker profile
/live                      → YouTube live embeds, Stage 1 + Stage 2, tabs/toggle
/location                  → Maps + directions to both stages
/badge/[registrationId]    → Public-but-obscure shareable digital badge/ticket view
/admin/*                   → Authenticated admin panel (see §9)
/api/*                     → Route handlers (Razorpay webhook, ICS calendar generation, OG image gen, etc.)
```

Build this primarily as a **single flowing marketing/home page** (per Awwwards convention — a strong narrative scroll) with **deep-linkable sections** (`/#schedule`, `/#gallery`, etc.) AND dedicated full pages for content-heavy areas (schedule, gallery, registration flows, admin) that deserve their own routes, sitemap entries, and OG metadata.

---

## 3. TECH STACK & ARCHITECTURE

- **Framework:** Next.js 15+, App Router, TypeScript strict mode, React Server Components by default; Client Components only where interactivity requires it.
- **Styling:** Tailwind CSS (v4 if available) with a fully themed `tailwind.config` mapped to the color tokens in §1.1, plus CSS variables for runtime theme switching.
- **Animation:**
  - **Lenis** (or `@studio-freight/lenis`) for buttery smooth-scroll.
  - **Framer Motion** for component-level transitions, scroll-reveals, shared-element transitions between session cards and detail pages, and page transitions.
  - **GSAP + ScrollTrigger** (optional, if Framer Motion is insufficient) for the hero's more complex scroll-driven sequences (e.g., dome illustration parallax, arabesque pattern morphing on scroll).
  - Respect `prefers-reduced-motion` everywhere — provide a fully functional, motion-reduced fallback, not just "disable everything."
- **Backend/DB:** Supabase (Postgres + Row Level Security, Auth for admin, Storage for gallery media, Realtime for live registration counters / admin dashboard updates).
- **Payments:** Razorpay (Orders API + Webhooks) for the Musthafa Darimi Karippur paid session.
- **Email/Notifications:** Supabase Edge Functions (or Resend/Nodemailer) to send registration confirmations, payment receipts, and reminder emails; WhatsApp deep-links (using the provided `wa.me` link format) for share/contact CTAs rather than a WhatsApp Business API integration unless later requested.
- **i18n:** `next-intl` (or `next-i18next`) for English (default), Malayalam, Arabic — including **RTL layout mirroring for Arabic** (use CSS logical properties throughout: `margin-inline-start`, not `margin-left`, etc., so RTL isn't a bolt-on hack).
- **Forms/Validation:** React Hook Form + Zod schemas shared between client and server actions.
- **Deployment target:** Vercel-compatible (edge/server runtime aware), with Supabase as the persistent backend.
- **PDF generation:** For the downloadable brochure and digital badges — `@react-pdf/renderer` or a headless-Chromium approach (e.g., Puppeteer in a serverless function) rendering the actual on-brand layout, not a generic table.
- **QR codes:** `qrcode` library for badge check-in codes.
- **Analytics:** Wire up a privacy-respecting analytics option (Vercel Analytics / Plausible) — flag as optional if no account is provided, but scaffold the integration point.

Testing/quality bar: TypeScript strict, ESLint + Prettier configured, basic unit tests for form validation and Supabase query helpers, and Lighthouse targets of **90+ across Performance, Accessibility, Best Practices, SEO** on the production build (mobile throttled profile).

---

## 4. CONTENT MODULES — HOMEPAGE

### 4.1 Hero
- Full-bleed hero built around the **Jeelani Dome** motif (illustrated/parallaxed, not a flat photo), the calligraphic "Grand **Jeelani** Conference" wordmark in the scalloped-seal badge, the Arabic dars calligraphy lockup ("الدرس بجامع النور بادري" style), and the "From Baghdad to Malabar — Persian Artistry. Malabar Soul." tagline.
- Show date (Sunday, September 27), venue (Alathoorpadi, Melmuri), and a live **countdown timer** (§4.3) directly in the hero.
- Subtle ambient motion: floating four-point glints, slow-drifting arabesque pattern, minaret silhouette at the hero edge (as in the cover page) with gentle parallax on scroll/mouse-move.
- Primary CTAs: "Register Now" (scrolls to/opens registration selector), "Watch Live" (visible only when a stream is live — see §4.9), "View Schedule."

### 4.2 About / Central Idea
- Reproduce the *substance* of the theme book's "What Is Jeelani Conference?" narrative **in original wording** (do not verbatim-copy the theme book's paragraph text into the live site if that text is meant for print only — rewrite it as warm, accessible web copy that conveys the same meaning: commemorative/academic/spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani, blending tasawwuf and orthodox scholarship, framed around the Baghdad–Malabar dialogue, organized by Alathoorpadi Students Association, connecting historical learning with the living Dars tradition).
- Include the historical thread: Ottoman/Persian arabesque tilework from the Baghdad shrine (post-1534 Ottoman patronage) as the visual metaphor for the Jilani legacy traveling across regions and generations.
- Layout: editorial split-screen (dome imagery + arabesque pattern on one side, narrative copy with scroll-triggered line-by-line reveal on the other).

### 4.3 Countdown + Add to Calendar
- Live countdown to the event start (10:00 AM, Sunday Sept 27) styled with brass/turquoise numerals against navy, with the four-point glint animating at each digit tick or milestone.
- "Add to Calendar" — generate `.ics` download (server route) + one-click **Google Calendar** and **Outlook** links, pre-filled with event title, venue, and a short description; also offer per-session "add to calendar" from the schedule.
- Optional: browser push/email reminder opt-in tied to the registration record (e.g., "remind me 1 day before" / "remind me 1 hour before").

### 4.4 Program Schedule (interactive, dual-stage)
Model exactly this data (build as seed data + Supabase schema, editable from admin):

**Stage 01**
| Time | Item | Speaker(s) |
|---|---|---|
| 10:00–11:00 AM | Grand Assembly | — |
| 11:00–11:30 AM | Inaugural Ceremony | Sayyid Abdul Naser Hayy Shihab Thangal (Panakkad), Sayyid Fazal Shihab Thangal |
| 11:30 AM–12:30 PM | *Shaykh Jilani: Spirituality, Life and Vision* | Salim Faizy Kolathur |
| 12:30–1:30 PM | Lunch & Prayer | — |
| 2:00–3:30 PM | *The Aesthetics of Tazkiyat al-Nafs (Purification of the Soul)* | Shuhaibul Haithami, Hafiz Basheer Faizy Aripra |
| 3:30–5:00 PM | *A Dialogue Between Traditional Practices and Modern Criticisms of Bid'ah* | Ameer Hussain Hudawi, Shareef Faizy Kolathur |
| 5:00–6:20 PM | Jilani Jalsa (Grand Mawlid Gathering) | — |
| 8:00–9:00 PM | Jilani Conference | Sayyid Sadiq Ali Shihab Thangal (Panakkad), Elamkulam Usthad |
| 9:00 PM onward | Closing | Valiyudheen Faizy |

**Stage 02**
| Time | Item | Speaker(s) |
|---|---|---|
| 11:00 AM–1:00 PM | Dars Management Meet — *"Palli-dars: We Are the Successors of Tradition"* | Sayyid Muhammad Koya Thangal Jamalullaili, Abdussamad Pookkottur |
| 2:00–3:00 PM | Session | Abdussalam Faizy Cholode |
| 3:00–5:00 PM | Session (Paid, continues as a course) | Dr. Musthafa Darimi Karippur |
| 5:00–6:10 PM | Paper Presentation — *"Muhyiddin Mala and the Social Life of Malabar Muslims: A Study Focusing on Muhyiddin Mala"* | (presenter list from registrations) |

Build the schedule UI as:
- A **tabbed/toggle Stage 1 / Stage 2 timeline**, each item a scroll-reveal card with time, title, speaker(s), a short abstract (editable in admin, expandable), and — where relevant — a "Register" or "Watch" CTA linking to the matching registration/live page.
- A **"Happening Now" live indicator** (brass glint pulse) that auto-highlights the current item based on real device time on event day, computed against the schedule's stored timestamps (timezone: Asia/Kolkata).
- **Filter/search** (by stage, by speaker, by "paid" vs "free" vs "presentation").
- **Downloadable brochure**: a generated PDF (or pre-designed print-ready PDF asset if supplied later) reproducing this schedule on-brand — "Download Full Brochure" button in this section and in the footer.

### 4.5 Sessions (detail pages)
Each schedule item that constitutes a "session" gets a dedicated `/sessions/[slug]` page: hero banner with the arabesque motif, full topic description, full speaker bios (linking to `/speakers/[slug]`), time/stage/location info, related "Add to calendar," and — for the three bookable items — the relevant registration CTA (see §6).

### 4.6 Guests & Speakers
- Grid of all named individuals across both stages (Thangals, scholars, presenters), each with the **scalloped-seal photo frame** motif, name, honorific/title, and a short bio (admin-editable).
- Individual `/speakers/[slug]` pages with fuller bio, their session(s), and photo gallery if available.

### 4.7 Gallery
- Unified media gallery: **photos, videos, event highlights reels, and poster/print assets** (the theme book pages themselves — cover, badges, patterns — can seed the initial "identity" gallery category before live event photos exist).
- Masonry/justified grid with lightbox, category filters (Photos / Videos / Highlights / Posters), lazy-loaded via Supabase Storage, with a "Live Updates" mode that appends new admin-uploaded media in near-real-time via Supabase Realtime during/after the event (auto-toast: "New photos added").

### 4.8 Location / Directions
- Two-stage map: Stage 1 and Stage 2 at Alathoorpadi, Melmuri — embed an interactive map (Google Maps embed or Mapbox) with two pins, "Get Directions" deep-links (Google Maps app/web), and a short walking/parking note field (admin-editable).

### 4.9 YouTube Live Embeds
- `/live` page (and a homepage preview module) with a **Stage 1 / Stage 2 toggle**, each embedding the respective YouTube live video ID (stored in admin/Supabase, defaults to a "Stream starts at 10:00 AM — check back soon" placeholder state when no live ID is set, and a "Watch the replay" state after the event using the same field once it's a completed video).
- Auto-detect and surface a homepage banner ("🔴 LIVE NOW — Stage 1") when a stream is marked live in the admin panel, using Supabase Realtime so it appears without a page refresh.

### 4.10 Background Ambient Audio
- An optional, **user-initiated** (never autoplay-with-sound by default — respect browser policy and user consent) ambient nasheed/qasida or instrumental track with a minimal, elegant floating control (play/pause, volume, mute) styled as the **Ponnani hanging lamp** icon or a small oud/tambourine glyph — persists across route changes (client-side audio context), remembers user preference (on/off) in localStorage.

### 4.11 Theme, Language, and Navigation Chrome
- **Theme provider**: `next-themes`-based, three states — System (default), Light, Dark — accessible from a persistent control (see nav below).
- **Language selector**: English (default), Malayalam (മലയാളം), Arabic (العربية) — flag-free, text-label dropdown or elegant script-toggle chip; switching Arabic flips the entire layout to RTL (`dir="rtl"`) including navigation order, form field alignment, and the schedule/timeline visual flow — verify no icon or motif mirrors incorrectly (e.g., don't mirror the dome image, do mirror directional chevrons/arrows).
- **Navigation:**
  - **Desktop:** a refined top navigation bar (transparent-over-hero → solid-on-scroll transition) with primary sections, theme + language controls, and a prominent "Register" CTA button.
  - **Mobile:** a **floating bottom dock** (iOS-style, frosted-glass/blur background, using the motif icon set — dome/home, calendar/schedule, ticket/register, image/gallery, menu) fixed above the safe-area inset, with hapt-feeling tap animations (scale/spring via Framer Motion) and an active-state indicator styled with the brass glint.

### 4.12 Cursor / Hover / Scroll Micro-interactions (Awwwards-tier polish)
- Custom cursor (desktop only, disabled on touch) that morphs contextually: default dot → magnifying "view" on gallery items, "play" on video thumbnails, expands with a soft turquoise ring on interactive elements.
- Magnetic-hover buttons (CTA buttons subtly pull toward the cursor within a small radius).
- Scroll-linked reveal animations (fade+rise, clip-path wipes using the arabesque/scalloped shapes, staggered text reveals) on every major section — implemented performantly (IntersectionObserver-driven, GPU-accelerated transforms only, no layout-thrashing).
- Section-to-section smooth-scroll snapping is **optional and should be user-testable**; prefer free smooth scroll (Lenis) over hard snapping, which can frustrate mobile users.
- Loading state: an elegant branded preloader on first load (dome motif tracing itself in, or the four-point glint sequence) capped at a short, skippable duration — never block real content behind a long forced animation.

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Responsiveness
- Fluid design across the full range: small Android phones (360px) → tablets → laptops → ultra-wide desktop monitors (2560px+). Use fluid typography/spacing (`clamp()`), container queries where appropriate, and test the dock/nav/schedule/gallery layouts explicitly at 360, 390, 768, 1024, 1440, 1920, and 2560px.
- Touch targets ≥44px on mobile; no hover-only affordances that lock out touch users from functionality (hover effects are progressive enhancement only).

### 5.2 Theming
- Implement via CSS variables + `next-themes`, `class` strategy (`.dark` on `<html>`), SSR-safe (no flash-of-incorrect-theme — use the standard blocking inline script pattern).
- All motif/pattern SVGs must be theme-aware (recolor via `currentColor`/CSS vars, not hardcoded fills).

### 5.3 Accessibility
- WCAG 2.1 AA minimum: color contrast checked especially for Brass-on-Ivory and Rose-on-Navy combinations (adjust tints if needed while keeping them recognizably on-brand); full keyboard navigability including the custom cursor/dock/menu; proper ARIA roles for the tabbed schedule, live-region announcements for the "Happening Now" and "LIVE" indicators; captions/transcripts placeholder support for video content; reduced-motion alternate paths for every animated sequence.

### 5.4 Performance
- Target Core Web Vitals "Good" thresholds on real mobile hardware (throttled 4G): LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Image handling via `next/image` with Supabase Storage as the CDN-backed origin, AVIF/WebP, responsive `sizes`.
- Code-split heavy animation libraries and the admin panel bundle away from the public bundle entirely.

### 5.5 SEO / Sharing
- Full metadata per route, JSON-LD `Event` structured data (name, startDate, location, organizer) for the homepage, dynamic Open Graph images per session/speaker (generate via `next/og` using the scalloped-seal badge template), and a proper `sitemap.xml`/`robots.txt`.

---

## 6. REGISTRATION / BOOKING SYSTEM (three distinct flows)

Build a shared registration engine (Supabase tables + server actions + Zod schemas) with three configured flows layered on top:

### 6.1 Grand Assembly (private, SUFFA Dars students only)
- **Access:** Not publicly linked/discoverable — accessible only via a private, admin-generated link (e.g., a signed/obfuscated URL or a link gated behind an admin-issued access code distributed to dars coordinators). Ensure it is `noindex`, excluded from the sitemap, and not linked from any public nav.
- **Fields:** Name, Phone, Email (optional), Dars (searchable select — admin-manageable list of dars/institution names), Place.
- **The signature feature — the Slot/Spot Assignment Map:** After registering, each student must be shown **their exact assigned standing spot** for the Grand Assembly formation. Build this as:
  - An admin-configurable **grid/zone layout** (e.g., rows/blocks/sections mapped to an actual ground plan of the assembly area) stored in Supabase (a `grid_zones` table: zone id, row, capacity, label) and a visual editor in the admin panel to define/relabel zones and set per-zone capacity.
  - An **auto-assignment algorithm** (sequential fill by dars group, or admin-defined grouping rules — e.g., keep each dars cohort contiguous within its assigned block) run on registration, or a manual drag-and-drop assignment tool for admins to override.
  - A **student-facing visual "find my spot" screen**: an interactive top-down SVG/canvas diagram of the assembly ground, highlighting the student's assigned zone/row/position with the four-point-glint marker, plus a plain-language instruction line ("Block B, Row 3, Position 12 — enter from the north gate near Stage 1") and a shareable/downloadable version of this spot card.
  - Real-time capacity display for admins (how full each zone/block is) via Supabase Realtime.

### 6.2 Session by Dr. Musthafa Darimi Karippur (paid, converts to ongoing course)
- **Framing:** Communicate clearly on the registration page that this session is the entry point to a **continuing course** — set expectations (what follows after the conference day) in the copy, pulling from admin-editable course-details content.
- **Fields:** Name, Phone, Email (optional), Place, Payment.
- **Payment:** Razorpay Orders API — create order server-side, open Razorpay Checkout client-side, verify payment signature server-side via webhook + immediate verification call, persist `payment_status` (pending/paid/failed/refunded) and `razorpay_payment_id`/`order_id` in Supabase, send an automated payment confirmation email/WhatsApp-link with a digital receipt and the digital badge (§1.6).
- Handle failure/retry gracefully (resumable checkout, clear error messaging, no double-charging — idempotent order creation keyed to the registrant).
- Admin panel must show payment reconciliation: total registrants, paid vs pending, revenue total, exportable CSV, and a manual "mark as paid" override for offline/cash payments with an audit note field.

### 6.3 Paper Presentation
- **Fields:** Name, Phone, Email (optional), Place — plus presentation-specific fields: **Paper title**, **Abstract** (short textarea), optionally a file upload (PDF/doc) to Supabase Storage for the submitted paper.
- Admin review workflow: status field (submitted → under review → accepted → scheduled), with the accepted list feeding the 5:00–6:10 PM Stage 2 "Paper Presentation" schedule slot automatically (or via one-click admin promotion from submission to schedule entry).

### 6.4 Shared registration UX requirements
- Every flow: real-time client + server (Zod) validation, phone number formatting/validation (India `+91` default, but don't hard-block other countries), duplicate-submission protection, a polished multi-step or single-scroll form (not a jarring native `<form>` default look — fully custom, on-brand styled inputs), a clear success state with the **digital badge/ticket** (§1.6) generated immediately, and a confirmation email.
- All registration data flows into the admin panel with full CRUD, search, filtering, and export (CSV/Excel) per flow.

---

## 7. DATA MODEL (Supabase — starting schema, agent may extend)

Design and implement (with RLS policies — public can only `insert` their own registration rows and `select` their own badge by a private token; admins have full access via an `admin` role check):

- `sessions` — id, slug, stage, start_time, end_time, title, description, type (enum: talk/ceremony/meal/mawlid/meeting/paid_session/paper_presentation), is_paid, price, speaker_ids[], created_by, updated_at
- `speakers` — id, slug, name, honorific, bio, photo_url, sessions[]
- `dars_list` — id, name (for the Grand Assembly dars selector, admin-manageable)
- `grid_zones` — id, label, row, block, capacity, position_x, position_y (for the assembly spot map)
- `registrations_grand_assembly` — id, name, phone, email, dars_id, place, assigned_zone_id, assigned_position, created_at, access_token
- `registrations_darimi_session` — id, name, phone, email, place, payment_status, razorpay_order_id, razorpay_payment_id, amount, created_at
- `registrations_paper_presentation` — id, name, phone, email, place, paper_title, abstract, file_url, status, created_at
- `gallery_media` — id, type (photo/video/highlight/poster), url, thumbnail_url, caption, category, uploaded_by, created_at
- `live_streams` — id, stage (1/2), youtube_video_id, is_live (bool), updated_at
- `site_settings` — key/value store for admin-editable global content (hero tagline, countdown target datetime, brochure PDF URL, calendar note, location notes, ambient audio track URL, etc.)
- `admin_users` — linked to Supabase Auth, role field
- `audit_log` — for admin actions on registrations/payments (who changed what, when)

Add appropriate indexes (on `slug`, `phone`, `payment_status`, `stage`) and Postgres functions/triggers where useful (e.g., auto-updating `updated_at`, auto-incrementing zone occupancy counts).

---

## 8. ADMIN PANEL (`/admin`, authenticated via Supabase Auth)

Build a **premium, dashboard-grade** admin experience — not a bare CRUD table dump — themed consistently with the public site's design language but in a denser, data-first layout:

- **Auth:** Supabase Auth (email/password or magic link) restricted to `admin_users`; route-level middleware protection; role-based access if multiple admin tiers are needed later (super-admin vs. content-editor vs. registration-desk-staff who only needs check-in scanning).
- **Dashboard home:** live KPI tiles (total registrations per flow, revenue collected, zone occupancy %, live-stream status, days/hours to event) with Supabase Realtime-driven auto-updating numbers and simple charts (registrations over time).
- **Content management:** full editor for every homepage/schedule/speaker/session/gallery/site-setting field defined above — no hardcoded copy should require a code deploy to change. Rich-text or structured fields as appropriate; image upload directly to Supabase Storage with preview.
- **Schedule builder:** drag-and-drop or form-based editor for both stages' timelines, with instant preview matching the public `/schedule` rendering.
- **Grand Assembly zone/slot manager:** the visual zone editor and manual assignment override described in §6.1, plus bulk import (CSV) of dars cohorts if needed.
- **Registrations tables:** per-flow, sortable/filterable/searchable, with row-level detail drawers, manual edit, export, and (for the paid flow) payment status controls and refund-note logging.
- **Paper presentation review queue:** kanban or status-list view (submitted → reviewed → accepted → scheduled).
- **Gallery manager:** bulk upload, categorize, reorder, delete, and a "publish live during event" toggle.
- **Live stream control:** set/clear the YouTube video ID per stage and toggle `is_live` — this is what drives the public "LIVE NOW" banner and `/live` page in real time.
- **Check-in mode (optional but recommended):** a QR-scanner view (using device camera, `html5-qrcode` or similar) for staff to scan attendee badges at entry and mark them checked-in, with instant duplicate-scan warnings.
- **Audit trail:** view of `audit_log` for accountability on registration/payment edits.

---

## 9. LANGUAGE & LOCALIZATION NOTES

- All UI strings, schedule content, speaker bios, and site settings must be structured as translatable fields (either JSONB multi-locale columns in Supabase, e.g. `title_en / title_ml / title_ar`, or a normalized `translations` table keyed by content id + locale) — the admin panel must let editors fill in all three languages per field, gracefully falling back to English if a translation is missing (never render a blank).
- Arabic content in particular deserves care: use real Arabic diacritics/orthography where names/terms are transliterated (e.g., Shaykh ʿAbd al-Qādir al-Jīlānī) and correct Naskh rendering — do not machine-transliterate sloppily.
- Malayalam is the audience's primary spoken language for this Dars community — treat the Malayalam translation as equally first-class as English, not an afterthought locale.

---

## 10. BRAND VOICE FOR ANY GENERATED COPY

Wherever the agent must draft placeholder or connective copy (microcopy, empty states, confirmation messages, error states, admin labels), the tone should be: **dignified, warm, scholarly-but-accessible, never overly casual, never corporate-marketing-speak.** Avoid emoji outside of very restrained, event-appropriate use (e.g., a single 🔴 for "live," a 📅 for calendar actions) — the visual ornamentation should carry the festive/spiritual warmth, not slang or excessive emoji.

---

## 11. FOOTER / CONTACT / SOCIAL

Implement a rich footer (and a dedicated `/contact` section or block) surfacing all official channels exactly as provided, each with correct icon, `rel="noopener noreferrer"`, and `target="_blank"` where external:

- **Dars website:** https://alathurpadidars.in/
- **Email:** alathurpadidars@gmail.com (mailto link)
- **WhatsApp (direct chat):** https://api.whatsapp.com/send?phone=919074525205
- **WhatsApp Channel:** https://whatsapp.com/channel/0029VaEKsh01t90eFbaYwN1h
- **Instagram:** https://www.instagram.com/alathurpadi_dars/
- **Facebook:** https://www.facebook.com/alathurpadidars
- **X (Twitter):** https://x.com/alathurpadidars
- **YouTube:** https://www.youtube.com/alathurpadidars

Footer should also restate the "People. Ideas. Heritage. A Brighter Tomorrow." line (per the theme book's closing keepsake page) against a Spiritual Black background with a subtle brass sparkle, plus organizer credit: "Organized by Alathoorpadi Students Association."

---

## 12. DELIVERY EXPECTATIONS FOR THE AGENT

1. Scaffold the Next.js + Supabase project structure first; commit early and often with clear messages.
2. Build the **design system/token layer and motif component library (§1)** before feature pages — every subsequent page should consume this system, not redefine styles ad hoc.
3. Build the **home page narrative scroll (§4)** end-to-end with real (seeded) schedule/speaker data from §4.4 before polishing micro-interactions — get the structure and content right first, then layer in motion/cursor/pattern polish (§4.12).
4. Build the **three registration flows and their shared engine (§6–7)** with working Supabase persistence and, for the paid flow, a functioning Razorpay **test-mode** integration.
5. Build the **admin panel (§8)** sufficient to manage everything above without a code change.
6. Pass over the whole app for **responsiveness, theming, i18n/RTL correctness, and accessibility (§5, §9)**.
7. Run a final performance/SEO pass and document any remaining follow-ups (e.g., "needs real photography," "needs Razorpay live keys," "needs final Arabic copy review by a native speaker") in `DECISIONS.md` / `TODO.md` at the repo root rather than silently guessing on things a human should confirm — but still ship a fully functional, realistic placeholder for every such item so the app is demoable end-to-end today.

Treat this brief as the single source of truth for scope. Where the theme book and this brief could be read two ways, prioritize: **(1) legibility and usability for a real multigenerational, multilingual attendee base, (2) faithfulness to the theme book's visual system, (3) motion/interaction polish.**
