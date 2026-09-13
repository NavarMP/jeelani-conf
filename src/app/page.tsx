import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Countdown } from "@/components/sections/Countdown";
import { Schedule } from "@/components/sections/Schedule";
import { Speakers } from "@/components/sections/Speakers";
import { Registration } from "@/components/sections/Registration";
import { Gallery } from "@/components/sections/Gallery";
import { LiveStreamPreview } from "@/components/sections/LiveStreamPreview";
import { Location } from "@/components/sections/Location";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Countdown />
      <Schedule />
      <Speakers />
      <Registration />
      <Gallery />
      {/* <LiveStreamPreview /> */}
      <Location />
    </>
  );
}
