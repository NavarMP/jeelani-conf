# Grand Jeelani Conference — Task Tracker

## Phase 0 — Complete Assets Directory ✅
- [x] Create `assets/motifs/` directory structure
- [x] Tile Repeat (Stroke) SVG
- [x] Tile Repeat (Fill) SVG
- [x] Four-Point Glint SVG
- [x] Ponnani Hanging Lamp SVG
- [x] Jeelani Dome Arabesque (Stroke) SVG
- [x] Jeelani Dome Arabesque (Fill) SVG
- [x] Scalloped Seal SVG
- [x] Baghdad Rose Ogee Arabesque SVG
- [x] Arabesque Tile Pattern (tileable) SVG
- [x] Mihrab Arch Border SVG
- [x] Mashrabiya Lattice SVG
- [x] Favicon SVG

## Phase 1 — Project Scaffold & Design System ✅
- [x] Initialize Next.js project
- [x] Configure Tailwind CSS with theme tokens
- [x] Set up CSS custom properties (light/dark)
- [x] Configure font stacks (5 Google Fonts)
- [x] Set up ThemeProvider (next-themes)
- [x] Create DECISIONS.md
- [x] Copy all assets to public/

## Phase 2 — Homepage Narrative Scroll ✅
- [x] Hero section (dome parallax, wordmark, floating glints, CTAs)
- [x] About / Central Idea section (split layout, staggered reveal)
- [x] Countdown + Add to Calendar (live ticker, Google Cal / ICS)
- [x] Program Schedule (dual-stage, timeline cards)
- [x] Speakers section (scalloped-seal frames, silhouettes)
- [x] Registration CTA block (3 flow cards)
- [x] Gallery preview (masonry, gradient placeholders)
- [x] Live Stream preview (two stage cards, YouTube)
- [x] Location / Directions (OSM embed, venue details)
- [x] Footer (arabesque pattern, social links, tagline)
- [x] Navbar (transparent→solid scroll, theme toggle, mobile menu)
- [x] Mobile Dock (frosted-glass, spring animations)
- [x] Ambient Audio Player (lamp button, volume, localStorage)

## Phase 3 — Deep-Linkable Pages ✅
- [x] `/sessions/[slug]` (13 static paths generated)
- [x] `/schedule` full page (stage tabs, search)
- [x] `/gallery` full page (categories, masonry)
- [x] `/live` page (YouTube embeds, stage toggle)
- [ ] `/speakers` grid (standalone page)
- [ ] `/speakers/[slug]` (individual profiles)
- [ ] `/location` page (standalone)
- [ ] `/badge/[registrationId]` (digital badge)

## Phase 4 — Registration System ✅ (UI only)
- [x] Grand Assembly registration (private/invite)
- [x] Musthafa Darimi registration (paid, Razorpay deferred)
- [x] Paper Presentation registration (free)
- [x] Calendar ICS API endpoint
- [ ] Supabase schema SQL
- [ ] Zod validation schemas
- [ ] Razorpay API routes (DEFERRED)
- [ ] OG image generation
- [ ] Digital Badge component

## Phase 5 — Admin Panel
- [ ] Admin layout + auth guard
- [ ] Dashboard home (KPIs)
- [ ] Content management
- [ ] Schedule builder
- [ ] Zone/slot manager
- [ ] Registrations tables
- [ ] Paper review queue
- [ ] Gallery manager
- [ ] Live stream control
- [ ] Audit trail

## Phase 6 — Polish, i18n, RTL, Accessibility
- [x] Base responsiveness (fluid typography, containers)
- [x] CSS logical properties for RTL readiness
- [x] prefers-reduced-motion support
- [x] Custom scrollbar
- [x] Focus-visible styles
- [ ] Full responsiveness pass (360px–2560px)
- [ ] Translation files (EN/ML/AR)
- [ ] RTL layout verification with Arabic
- [ ] WCAG 2.1 AA contrast checking
- [ ] Custom cursor (desktop)
- [ ] Branded preloader

## Phase 7 — Performance, SEO & Final Pass
- [x] Comprehensive metadata in layout
- [x] Favicon SVG
- [x] Theme color meta tag
- [x] JSON-LD Event structured data (layout)
- [ ] Sitemap & robots.txt
- [ ] next/image optimization pass
- [ ] Code splitting review
- [ ] Lighthouse audit
