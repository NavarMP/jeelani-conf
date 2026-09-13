import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const siteSettings = await getSiteSettings();
    const { searchParams } = new URL(request.url);
    
    // Dynamic values from URL params
    const title = searchParams.has("title")
      ? searchParams.get("title")
      : "Grand Jeelani Conference";
      
    const description = searchParams.has("desc")
      ? searchParams.get("desc")
      : siteSettings.tagline;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#103E79", // var(--color-navy)
            backgroundImage: "radial-gradient(circle at 50% 120%, #218EB6 0%, #103E79 60%)",
            color: "white",
            textAlign: "center",
            padding: "40px",
          }}
        >
          {/* Decorative Pattern / Motif Placeholder */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "200px",
              height: "200px",
              border: "2px solid rgba(255, 200, 0, 0.2)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "-50px",
              width: "300px",
              height: "300px",
              border: "4px solid rgba(33, 142, 182, 0.2)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "800px",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#FFC800", // var(--color-brass)
                marginBottom: 20,
              }}
            >
              {siteSettings.organizer}
            </div>

            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 30,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 32,
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: 40,
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                fontSize: 24,
                fontWeight: 500,
                color: "#FFC800",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                padding: "16px 32px",
                borderRadius: "100px",
                border: "1px solid rgba(255, 200, 0, 0.3)",
              }}
            >
              <span>Sept 27, 2026</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>Alathoorpadi, Melmuri</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
