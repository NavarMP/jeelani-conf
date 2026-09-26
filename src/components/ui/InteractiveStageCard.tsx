"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";

interface StageLocation {
  slug: string;
  name: string;
  description?: string;
  location_address?: string;
  map_url?: string;
  embed_url?: string;
  image_url?: string;
}

interface InteractiveStageCardProps {
  stage: StageLocation;
  index: number;
}

export function InteractiveStageCard({ stage, index }: InteractiveStageCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth the motion values for the rotation
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });
  
  // Map motion values to rotation range (-15 to 15 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to the center of the card (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    // Reset to initial position
    x.set(0);
    y.set(0);
  };

  // Default fallback image if none provided
  const bgImage = stage.image_url || `https://source.unsplash.com/random/800x600/?architecture,modern,${stage.slug}`;
  
  // Default map URL if none provided
  const mapUrl = stage.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stage.location_address || stage.name)}`;
  
  // Default embed URL if none provided
  const embedUrl = stage.embed_url || "https://maps.google.com/maps?q=11.071439,76.076833&hl=en&z=15&output=embed";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2, 
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className="relative group w-full h-[400px] md:h-[450px] rounded-3xl cursor-pointer"
    >
      {/* Background Map Embed with Parallax & Glassmorphism overlay */}
      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-[var(--color-navy)]/20 dark:shadow-[var(--color-turquoise)]/10"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Iframe Embed */}
        <div className="absolute inset-0 pointer-events-none grayscale-[30%] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full object-cover scale-[1.2]"
          />
        </div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 transition-all duration-500 group-hover:bg-black/30 group-hover:backdrop-blur-[1px]"></div>
        
        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-[var(--color-turquoise)]/50 transition-colors duration-500 z-20"></div>
      </div>

      {/* Content wrapper with 3D translation */}
      <div 
        className="relative h-full flex flex-col justify-between p-8 z-30 pointer-events-none"
        style={{ transform: "translateZ(50px)" }}
      >
        {/* Top section: Icon & Name */}
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
            <MapPin className="w-6 h-6 group-hover:animate-bounce" />
          </div>
          <div>
            <h3 
              className="text-2xl md:text-3xl font-bold text-white tracking-wide"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              {stage.name}
            </h3>
            <p className="text-white/80 text-sm mt-2 font-medium line-clamp-2">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Bottom section: Address & Button */}
        <div className="flex flex-col gap-5 mt-auto">
          {stage.location_address && (
            <div className="flex gap-3 items-start bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <MapPin className="w-5 h-5 text-[var(--color-turquoise)] shrink-0 mt-0.5" />
              <p className="text-white text-sm font-medium">
                {stage.location_address}
              </p>
            </div>
          )}
          
          <div className="self-start pointer-events-auto">
            <Magnetic pattern="select">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white text-[var(--color-navy)] hover:bg-[var(--color-turquoise)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
