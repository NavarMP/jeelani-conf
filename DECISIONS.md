# DECISIONS.md — Grand Jeelani Conference Web Application

> Sensible decisions made during development, as directed by the build brief.

## Architecture Decisions

### 1. Maps Integration — OpenStreetMap (Free) over Google Maps
**Decision:** Use OpenStreetMap via Leaflet.js or a static iframe embed instead of Google Maps API.
**Rationale:** The project aims to be free/low-cost. Google Maps JavaScript API requires billing. OpenStreetMap with a `<iframe>` embed or Leaflet is completely free.
**Location coordinates:** Will be extracted from the provided Google Maps link.

### 2. Razorpay — Deferred
**Decision:** Razorpay integration is scaffolded but not connected.
**Rationale:** Per user direction, payment integration is skipped for now. The paid session registration form UI is built but submits without payment processing.

### 3. Speaker Photos — Styled Placeholder Silhouettes
**Decision:** Use elegant themed placeholder silhouettes with the scalloped-seal frame instead of real photos.
**Rationale:** No speaker photos are currently available. The silhouettes use the dome motif and are on-brand.

### 4. Ambient Audio — User-Provided Track
**Decision:** Using the provided `ambient-music.mp3` file for the optional ambient audio player.
**Rationale:** User supplied the specific track. Player is user-initiated only (never autoplay).

### 5. YouTube Live Demo Videos
**Decision:** Using two provided YouTube live URLs as demo/placeholder for the dual-stage live stream feature:
- Stage 1: `https://www.youtube.com/live/X7Xw7dRlGJo`
- Stage 2: `https://www.youtube.com/live/Ycwr1oqQpv0`

### 6. Supabase — Scaffolded, Not Connected
**Decision:** Supabase client code, schema SQL, and typed helpers are created but not connected to a live project.
**Rationale:** No Supabase credentials provided yet. All data is seeded as static JSON for demo purposes.

### 7. Typography — Wordmarks as SVG Assets
**Decision:** The custom calligraphic "Grand Jeelani Conference" wordmark is used as a locked SVG asset (provided in `assets/`) rather than approximated with webfonts.
**Rationale:** The theme book's custom lettering cannot be faithfully reproduced with available webfonts. Body text uses `Inter` + `Noto Sans Malayalam` + `Noto Naskh Arabic`.

### 8. Font Strategy — Google Fonts (Free)
**Decision:** All fonts sourced from Google Fonts (free, no licensing cost):
- `Bodoni Moda` for display headlines
- `Inter` for body/UI
- `Noto Sans Malayalam` for Malayalam text
- `Noto Naskh Arabic` for Arabic body text
- `Reem Kufi` for Arabic display text

### 9. CSS Logical Properties Throughout
**Decision:** Using CSS logical properties (`margin-inline-start`, `padding-inline-end`, etc.) exclusively instead of directional properties (`margin-left`, `padding-right`).
**Rationale:** Ensures RTL layout for Arabic works correctly without a separate stylesheet or hacks.

## Items Requiring Human Follow-Up

- [ ] Supabase project creation and credentials
- [ ] Real speaker photographs
- [ ] Razorpay live/test keys (when ready)
- [ ] Final Arabic copy review by a native speaker
- [ ] Real event photography for gallery
- [ ] DNS configuration for `gjc.alathurpadidars.in`
- [ ] Vercel deployment setup
- [ ] Privacy policy / terms (if collecting registrations)
