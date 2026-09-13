import { Location as LocationSection } from "@/components/sections/Location";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location & Directions",
  description: "Join us at Alathoorpadi, Melmuri for the Grand Jeelani Conference.",
};

export default function LocationPage() {
  return (
    <div className="min-h-[100dvh] pt-16">
      <LocationSection />
    </div>
  );
}
