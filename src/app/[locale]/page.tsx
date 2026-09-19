import { Opening } from "@/components/sections/Opening";
import { Schedule } from "@/components/sections/Schedule";
import { Speakers } from "@/components/sections/Speakers";
import { Registration } from "@/components/sections/Registration";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { getSiteSettings, getSessions, getSpeakers, getRegistrationSessions, getPublishedGalleryMedia } from "@/lib/data";
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const [siteSettings, sessions, speakers, registrationSessions, galleryMedia] = await Promise.all([
    getSiteSettings(),
    getSessions(),
    getSpeakers(),
    getRegistrationSessions(),
    getPublishedGalleryMedia(),
  ]);

  return (
    <>
      <Opening targetDate={siteSettings.eventDate} brochureUrl={siteSettings.brochure_url?.url} />
      <Schedule sessions={sessions} />
      <Speakers speakers={speakers.filter(s => s.featured)} />
      <Registration registrationSessions={registrationSessions} />
      <Gallery galleryItems={galleryMedia} />
      {/* <LiveStreamPreview /> */}
      <Location locationMapUrl={siteSettings.locationMapUrl} />
    </>
  );
}
