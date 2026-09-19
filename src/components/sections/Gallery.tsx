"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Maximize2, Play, X } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { haptic } from "@/lib/haptics";
import { Magnetic } from "@/components/ui/Magnetic";
import { getMediaType, getYouTubeThumbnail, getEmbedUrl } from "@/lib/mediaUtils";
import { InstagramEmbed } from 'react-social-media-embed';

export function Gallery({ galleryItems = [] }: { galleryItems?: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Gallery");
  useSectionEnterHaptic(isInView);
  
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Fallback items if none passed
  const itemsToRender = galleryItems.length > 0 ? galleryItems : [
    { id: 1, aspect: "4/5", color: "from-[#103E79] to-[#218EB6]", title: "Conference Hall" },
    { id: 2, aspect: "3/4", color: "from-[#218EB6] to-[#103E79]", title: "Stage Design" },
    { id: 3, aspect: "1/1", color: "from-[#BA6473] to-[#103E79]", title: "Arabesque Details" },
    { id: 4, aspect: "3/4", color: "from-[#103E79] to-[#2B2A29]", title: "Scholarly Discourse" },
    { id: 5, aspect: "4/5", color: "from-[#218EB6] to-[#BA6473]", title: "Calligraphy" },
    { id: 6, aspect: "1/1", color: "from-[#2B2A29] to-[#103E79]", title: "Mawlid Gathering" },
  ];


  return (
    <section id="gallery" className="relative py-20 md:py-28" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            {t("eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto text-sm">
            {t("description")}
          </p>
        </motion.div>

        {/* Masonry-like grid */}
        <div className="columns-2 md:columns-3 gap-3 space-y-3 max-w-4xl mx-auto">
          {itemsToRender.map((item, i) => {
            const mediaType = getMediaType(item.url);
            const ytThumb = mediaType === 'youtube' ? getYouTubeThumbnail(item.url) : null;
            
            return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileTap={{ scale: 0.96 }}
              onTapStart={() => haptic("tap")}
              onClick={() => {
                if (item.url) setPreviewItem(item);
              }}
              className="break-inside-avoid group cursor-pointer"
            >
              <div
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${item.color || "from-[#103E79] to-[#218EB6]"} shadow-sm group-hover:shadow-lg transition-all`}
                style={{ aspectRatio: item.aspect || "4/5" }}
              >
                
                {/* Media Rendering */}
                {mediaType === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                ) : mediaType === 'youtube' && ytThumb ? (
                  <img src={ytThumb} alt={item.title} className="w-full h-full object-cover" />
                ) : item.url ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {/* Fallback Pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: "url('/motifs/tile-repeat-stroke.svg')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "80px 80px",
                      }}
                      aria-hidden="true"
                    />

                    {/* Fallback Center dome motif */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-20 h-20 bg-white/20"
                        style={{
                          WebkitMaskImage: "url('/motifs/jeelani-dome-stroke.svg')",
                          WebkitMaskSize: "contain",
                          WebkitMaskPosition: "center",
                          WebkitMaskRepeat: "no-repeat",
                          maskImage: "url('/motifs/jeelani-dome-stroke.svg')",
                          maskSize: "contain",
                          maskPosition: "center",
                          maskRepeat: "no-repeat",
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </>
                )}

                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs text-white/90 font-medium">{item.title || (item.labelKey ? t(item.labelKey) : "")}</p>
                </div>

                {/* Hover expand icon */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                  {mediaType === 'video' || mediaType === 'youtube' ? (
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-white" strokeWidth={2} aria-hidden="true" />
                  )}
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        {/* View full gallery link */}
        <div className="text-center mt-10">
          <Magnetic pattern="tap">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
            >
              {t("viewFullGallery")}
            </Link>
          </Magnetic>
        </div>
      </div>
      
      {/* Lightbox Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-pointer"
            onClick={() => setPreviewItem(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setPreviewItem(null)}
            >
              <X size={24} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-5xl w-full max-h-[85vh] relative flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const type = getMediaType(previewItem.url);
                if (type === 'video') {
                  return <video src={previewItem.url} controls className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" autoPlay />;
                } else if (type === 'youtube' || type === 'vimeo') {
                  const embedUrl = getEmbedUrl(previewItem.url, type);
                  return (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                      <iframe
                        src={`${embedUrl}${embedUrl?.includes('?') ? '&' : '?'}autoplay=1`}
                        title={previewItem.title || "Embedded video"}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  );
                } else if (type === 'instagram') {
                  return <div className="max-w-[400px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl"><InstagramEmbed url={previewItem.url} width="100%" /></div>;
                } else {
                  return <img src={previewItem.url} alt={previewItem.title} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />;
                }
              })()}
              
              {/* Info Bar */}
              <div className="absolute -bottom-14 left-0 right-0 flex justify-between items-center px-4">
                <h3 className="text-white font-medium text-lg">{previewItem.title}</h3>
                {previewItem.category?.name && (
                  <span className="text-white/60 text-sm px-3 py-1 rounded-full bg-white/10">{previewItem.category.name}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
