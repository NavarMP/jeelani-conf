import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/data";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const siteSettings = await getSiteSettings();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get("type") || "default";
    const title = searchParams.get("title") || "Grand Jeelani Conference";
    const desc = searchParams.get("desc") || siteSettings.tagline;
    const image = searchParams.get("image");
    const time = searchParams.get("time");

    // Reusable styles
    const bgGradient = "radial-gradient(circle at 50% 120%, #218EB6 0%, #103E79 80%)";
    const accentColor = "#FFC800"; // Brass

    if (type === "speaker") {
      return new ImageResponse(
        (
          <div style={{ height: "100%", width: "100%", display: "flex", backgroundColor: "#0A2540", backgroundImage: bgGradient, color: "white", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", width: "100%", height: "100%", padding: "60px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "55%", justifyContent: "center" }}>
                <div style={{ fontSize: 28, textTransform: "uppercase", letterSpacing: "0.2em", color: accentColor, marginBottom: 20 }}>
                  Featured Speaker
                </div>
                <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
                  {title}
                </div>
                <div style={{ fontSize: 36, color: "rgba(255, 255, 255, 0.8)", marginBottom: 40, lineHeight: 1.4, borderLeft: `4px solid ${accentColor}`, paddingLeft: "24px" }}>
                  {desc}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "auto" }}>
                  <div style={{ display: "flex", width: 48, height: 48, borderRadius: 24, backgroundColor: accentColor, alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 600 }}>{siteSettings.title}</span>
                </div>
              </div>
              <div style={{ display: "flex", width: "40%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={title} style={{ width: 400, height: 400, borderRadius: 200, objectFit: "cover", border: `8px solid ${accentColor}`, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }} />
                ) : (
                  <div style={{ width: 400, height: 400, borderRadius: 200, border: `8px solid ${accentColor}`, backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 120 }}>🎙️</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    if (type === "session") {
      return new ImageResponse(
        (
          <div style={{ height: "100%", width: "100%", display: "flex", backgroundColor: "#0A2540", backgroundImage: bgGradient, color: "white", padding: "60px", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "auto" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Conference Session
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: "100px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: 24 }}>{time || "Schedule TBA"}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "60px", marginBottom: "60px" }}>
              <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1, marginBottom: 32, textShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                {title}
              </div>
              <div style={{ fontSize: 40, color: "rgba(255, 255, 255, 0.9)", display: "flex", alignItems: "center", gap: "20px" }}>
                <span style={{ opacity: 0.7 }}>Featuring</span>
                <span style={{ fontWeight: 600, color: accentColor }}>{desc}</span>
              </div>
            </div>

            <div style={{ display: "flex", width: "100%", marginTop: "auto", borderTop: "2px solid rgba(255,255,255,0.2)", paddingTop: "40px", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 32, fontWeight: 500 }}>{siteSettings.title}</span>
              <span style={{ fontSize: 24, opacity: 0.8 }}>Sept 27, 2026 • Alathurpadi, Melmuri</span>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    if (type === "register") {
      return new ImageResponse(
        (
          <div style={{ height: "100%", width: "100%", display: "flex", backgroundColor: "#0A2540", backgroundImage: bgGradient, color: "white", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px", background: "rgba(0,0,0,0.3)", borderRadius: "32px", border: `2px solid rgba(255, 200, 0, 0.4)`, backdropFilter: "blur(20px)", maxWidth: "900px" }}>
              <div style={{ backgroundColor: accentColor, color: "#0A2540", padding: "12px 32px", borderRadius: "100px", fontSize: 28, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "40px", boxShadow: "0 8px 32px rgba(255, 200, 0, 0.4)" }}>
                Registration Open
              </div>
              <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
                {title}
              </div>
              <div style={{ fontSize: 32, color: "rgba(255, 255, 255, 0.8)", marginBottom: 48, maxWidth: "700px" }}>
                {desc}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontSize: 28, fontWeight: 600 }}>
                <span>Secure your spot today</span>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Default template (fallback)
    return new ImageResponse(
      (
        <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0A2540", backgroundImage: bgGradient, color: "white", textAlign: "center", padding: "60px" }}>
          {/* Decorative Elements */}
          <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", border: `2px solid rgba(255, 200, 0, 0.1)`, borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "500px", height: "500px", border: `4px solid rgba(33, 142, 182, 0.2)`, borderRadius: "50%" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: "900px", zIndex: 10 }}>
            <div style={{ fontSize: 28, textTransform: "uppercase", letterSpacing: "0.25em", color: accentColor, marginBottom: 24, fontWeight: 600 }}>
              {siteSettings.organizer}
            </div>

            <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1.1, marginBottom: 32, textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
              {title}
            </div>

            <div style={{ fontSize: 36, color: "rgba(255, 255, 255, 0.8)", marginBottom: 48, lineHeight: 1.4 }}>
              {desc}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", fontSize: 28, fontWeight: 500, color: "white", backgroundColor: "rgba(0, 0, 0, 0.3)", padding: "20px 40px", borderRadius: "100px", border: `1px solid rgba(255, 200, 0, 0.4)`, backdropFilter: "blur(10px)" }}>
              <span style={{ color: accentColor }}>Sept 27, 2026</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>Alathurpadi, Melmuri</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
