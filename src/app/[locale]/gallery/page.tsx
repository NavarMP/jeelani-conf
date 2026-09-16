"use client";

import { motion } from "framer-motion";

const galleryCategories = ["All", "Architecture", "Calligraphy", "Gatherings", "Heritage", "Nature"];

const galleryItems = [
  { id: 1, aspect: "4/5", color: "from-[#103E79] to-[#218EB6]", label: "Conference Hall", category: "Architecture" },
  { id: 2, aspect: "3/4", color: "from-[#218EB6] to-[#103E79]", label: "Stage Design", category: "Architecture" },
  { id: 3, aspect: "1/1", color: "from-[#BA6473] to-[#103E79]", label: "Arabesque Details", category: "Calligraphy" },
  { id: 4, aspect: "3/4", color: "from-[#103E79] to-[#2B2A29]", label: "Scholarly Discourse", category: "Gatherings" },
  { id: 5, aspect: "4/5", color: "from-[#218EB6] to-[#BA6473]", label: "Islamic Calligraphy", category: "Calligraphy" },
  { id: 6, aspect: "1/1", color: "from-[#2B2A29] to-[#103E79]", label: "Mawlid Gathering", category: "Gatherings" },
  { id: 7, aspect: "3/4", color: "from-[#FFC800]/50 to-[#103E79]", label: "Lamp Brass Detail", category: "Heritage" },
  { id: 8, aspect: "4/5", color: "from-[#103E79] to-[#218EB6]", label: "Dome Interior", category: "Architecture" },
  { id: 9, aspect: "1/1", color: "from-[#BA6473] to-[#2B2A29]", label: "Rose Garden", category: "Nature" },
  { id: 10, aspect: "3/4", color: "from-[#218EB6] to-[#2B2A29]", label: "Tile Pattern", category: "Heritage" },
  { id: 11, aspect: "4/5", color: "from-[#103E79] to-[#BA6473]", label: "Community Event", category: "Gatherings" },
  { id: 12, aspect: "1/1", color: "from-[#2B2A29] to-[#218EB6]", label: "Persian Motif", category: "Heritage" },
];

export default function GalleryPage() {
  return (
    <div className="min-h-[100dvh] pt-24 pb-32">
      <div className="container-site">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Gallery
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            Visual heritage of Islamic artistry, spirituality, and scholarly gatherings.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {galleryCategories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 rounded-full text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:border-[var(--color-turquoise)]/30 transition-all first:bg-[var(--color-navy)] first:text-white first:border-[var(--color-navy)]"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="break-inside-avoid group cursor-pointer"
            >
              <div
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${item.color} shadow-sm group-hover:shadow-lg transition-all`}
                style={{ aspectRatio: item.aspect }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "url('/motifs/tile-repeat-stroke.svg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "80px 80px",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 bg-white/15"
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
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50">
                  <p className="text-xs text-white/80 font-medium">{item.label}</p>
                  <p className="text-[10px] text-white/50">{item.category}</p>
                </div>
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <span className="text-white text-xs">⤢</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
