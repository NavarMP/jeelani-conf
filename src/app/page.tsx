import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Countdown } from "@/components/sections/Countdown";
import { Schedule } from "@/components/sections/Schedule";
import { Speakers } from "@/components/sections/Speakers";
import { Registration } from "@/components/sections/Registration";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { getSiteSettings, getSessions, getSpeakers } from "@/lib/data";

export default async function HomePage() {
  const [siteSettings, sessions, speakers] = await Promise.all([
    getSiteSettings(),
    getSessions(),
    getSpeakers(),
  ]);

  return (
    <>
      <Hero />
      <About />
      <Countdown targetDate={siteSettings.eventDate} />
      <Schedule sessions={sessions} />
      <Speakers speakers={speakers} />
      <Registration />
      <Gallery />
      {/* <LiveStreamPreview /> */}
      <Location locationMapUrl={siteSettings.locationMapUrl} />
    </>
  );
}
