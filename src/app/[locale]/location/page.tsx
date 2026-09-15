import { Location as LocationSection } from "@/components/sections/Location";
import { getSiteSettings } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location & Directions",
  description: "Join us at Alathurpadi, Melmuri for the Grand Jeelani Conference.",
};

export default async function LocationPage() {
  const siteSettings = await getSiteSettings();
  
  return (
    <div className="min-h-[100dvh] pt-16">
      <LocationSection locationMapUrl={siteSettings.locationMapUrl} />
    </div>
  );
}
