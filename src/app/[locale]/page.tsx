import { PhaseRouter } from "@/components/PhaseRouter";
import { getSiteSettings, getSessions, getSpeakers, getRegistrationSessions, getPublishedGalleryMedia, getLiveStreams } from "@/lib/data";
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const [siteSettings, sessions, speakers, registrationSessions, galleryMedia, liveStreams] = await Promise.all([
    getSiteSettings(),
    getSessions(),
    getSpeakers(),
    getRegistrationSessions(),
    getPublishedGalleryMedia(),
    getLiveStreams(),
  ]);

  return (
    <PhaseRouter 
      props={{
        siteSettings,
        sessions,
        speakers,
        registrationSessions,
        galleryMedia,
        liveStreams
      }}
    />
  );
}
