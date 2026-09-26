import React from 'react';
import { Opening } from "@/components/sections/Opening";
import { Schedule } from "@/components/sections/Schedule";
import { Speakers } from "@/components/sections/Speakers";
import { Registration } from "@/components/sections/Registration";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { motion } from 'framer-motion';

export function PreEventPhase({ props }: { props: any }) {
  const { siteSettings, sessions, speakers, registrationSessions, galleryMedia } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
      className="flex flex-col"
    >
      <Opening 
        targetDate={siteSettings.eventDate} 
        conferenceDocuments={siteSettings.conference_documents || (siteSettings.brochure_url ? [{id: "old", title: "Brochure", url: siteSettings.brochure_url.url}] : [])} 
      />
      <Schedule sessions={sessions} />
      <Registration registrationSessions={registrationSessions} />
      <Speakers speakers={speakers.filter((s: any) => s.featured)} />
      <Gallery galleryItems={galleryMedia} />
      <Location locationMapUrl={siteSettings.locationMapUrl} />
    </motion.div>
  );
}
