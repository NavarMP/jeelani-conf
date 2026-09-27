'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, Star, MessageCircle, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Schedule } from "@/components/sections/Schedule";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { Opening, AboutSection } from "@/components/sections/Opening";
import { Speakers } from "@/components/sections/Speakers";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useLiveEventState } from "@/lib/useLiveEventState";
import { FileText, ExternalLink } from "lucide-react";

export function OnEventPhase({ props }: { props: any }) {
  const { liveStreams, siteSettings, sessions, speakers, galleryMedia, stages } = props;
  const locale = useLocale();
  const stageKeys = liveStreams ? Object.keys(liveStreams).filter(k => liveStreams[k].isLive).sort() : [];
  const [activeStage, setActiveStage] = useState<string>(stageKeys[0] || "");
  const stream = liveStreams ? liveStreams[activeStage] || {} : {};
  
  const [reactions, setReactions] = useState<{id: number, type: string, x: number}[]>([]);
  const { liveState } = useLiveEventState(activeStage);
  
  // Real-time current session logic
  let activeSession = stream?.currentSession;
  let activeSpeaker = null;

  if (liveState) {
    if (liveState.mode === "manual" && liveState.current_session_id) {
      activeSession = sessions.find((s: any) => s.id === liveState.current_session_id) || activeSession;
    }
    if (liveState.current_speaker_id && activeSession?.speakers) {
      activeSpeaker = activeSession.speakers.find((s: any) => s.id === liveState.current_speaker_id);
    }
  }
  
  // Floating reactions logic
  const triggerReaction = (type: string) => {
    const newReaction = {
      id: Date.now(),
      type,
      x: Math.random() * 60 + 20 // random horizontal position 20-80%
    };
    setReactions(prev => [...prev, newReaction]);
    
    // Vibrate on mobile
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000); // remove after animation
  };

  const getReactionIcon = (type: string) => {
    switch(type) {
      case 'heart': return <Heart className="w-8 h-8 text-[var(--color-rose)] fill-[var(--color-rose)]" />;
      case 'thumb': return <ThumbsUp className="w-8 h-8 text-[var(--color-turquoise)] fill-[var(--color-turquoise)]" />;
      case 'star': return <Star className="w-8 h-8 text-[var(--color-brass)] fill-[var(--color-brass)]" />;
      default: return <Heart className="w-8 h-8 text-[var(--color-rose)]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
      className="flex flex-col"
    >
      {/* Hero Section */}
      <Opening 
        targetDate={siteSettings?.eventDate} 
        conferenceDocuments={siteSettings?.conference_documents || (siteSettings?.brochure_url ? [{id: "old", title: "Brochure", url: siteSettings.brochure_url.url}] : [])} 
        extraHeroButtons={
          <>
            <button onClick={() => document.getElementById('live-experience')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center px-8 py-3 rounded-full text-sm font-bold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-colors shadow-[0_0_20px_var(--shadow-glow-brass)]">
              Watch Live
            </button>
            <Link href={`/${locale}/feedback`} className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold border border-[var(--color-brass)] text-[var(--color-brass)] hover:bg-[var(--color-brass)]/10 transition-colors backdrop-blur-sm">
              Give Feedback
            </Link>
          </>
        }
        hideRegistrationButton={true}
        hideAbout={true}
        hideCountdown={true}
      />

      {/* Live Experience Section */}
      <section id="live-experience" className="bg-[#020617] text-white relative flex-1 flex flex-col py-24">
        {/* Dynamic Aurora Background for Live Experience */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-navy)]/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-brass)]/10 rounded-full blur-[150px] mix-blend-screen" />
        </div>
        
        <div className="container-site relative z-10 flex-1 flex flex-col">
        {/* Header & Stage Selection */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-brass)]">
              Live Experience
            </h1>
            <p className="text-white/60 text-sm">You are watching the Grand Jeelani Conference live.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
            {stageKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveStage(key)}
                className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  activeStage === key
                    ? "bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-turquoise)] text-white shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {liveStreams[key]?.name || key.replace("stage", "Stage ")}
                {liveStreams[key]?.isLive && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Theater Layout */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left: Video Player */}
          <div className="flex-1 flex flex-col">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black ring-1 ring-white/5">
              {stream?.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?rel=0&modestbranding=1&autoplay=1`}
                  title={`Live Stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-white/5">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-[var(--color-turquoise)] rounded-full animate-spin mb-4" />
                  Stream starting soon...
                </div>
              )}
              {/* Floating Reactions Container - Overlay on Video */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                <AnimatePresence>
                  {reactions.map(r => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 50, x: `${r.x}%`, scale: 0.5 }}
                      animate={{ opacity: 1, y: -400, x: `${r.x + (Math.random() * 20 - 10)}%`, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="absolute bottom-0"
                    >
                      {getReactionIcon(r.type)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <div className="flex gap-3">
                <button 
                  onClick={() => triggerReaction('heart')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Heart className="w-5 h-5 text-[var(--color-rose)]" />
                </button>
                <button 
                  onClick={() => triggerReaction('thumb')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <ThumbsUp className="w-5 h-5 text-[var(--color-turquoise)]" />
                </button>
                <button 
                  onClick={() => triggerReaction('star')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className="w-5 h-5 text-[var(--color-brass)]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Sidebar (Now Playing) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full lg:w-[400px] h-auto bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-turquoise)]/20 rounded-full blur-[50px]" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-brass)]/20 rounded-full blur-[60px]" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <h3 className="font-bold text-lg tracking-wide uppercase text-white/90">Now Playing</h3>
                  </div>
                </div>
                
                <div className="flex-1 relative z-10 flex flex-col gap-4">
                  {activeSession ? (
                    <>
                      <div>
                        <h4 className="text-2xl font-bold text-white mb-2 leading-tight">
                          {activeSession.title}
                        </h4>
                        <p className="text-sm text-white/60 line-clamp-3">
                          {activeSession.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-turquoise)] font-medium">
                        <div className="px-3 py-1.5 rounded-lg bg-[var(--color-turquoise)]/10 border border-[var(--color-turquoise)]/20">
                          {new Date(activeSession.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          {" - "}
                          {new Date(activeSession.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        {activeSession.type && (
                          <span className="uppercase text-xs tracking-wider opacity-80">{activeSession.type}</span>
                        )}
                      </div>

                      {/* Subtitle / Lower Third */}
                      <AnimatePresence>
                        {liveState?.subtitle_text && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-black/40 border-l-2 border-[var(--color-turquoise)] p-3 rounded-r-lg mt-2"
                          >
                            <p className="text-white text-sm italic">"{liveState.subtitle_text}"</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Speakers */}
                      {activeSession.speakers && activeSession.speakers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h5 className="text-xs uppercase tracking-wider text-white/40 mb-3">
                            {activeSpeaker ? "Currently On Stage" : "Speakers"}
                          </h5>
                          <div className="flex flex-col gap-3">
                            {(activeSpeaker ? [activeSpeaker] : activeSession.speakers).map((speaker: any) => (
                              <div key={speaker.id} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                                {speaker.image_url ? (
                                  <Image src={speaker.image_url} alt={speaker.name} width={40} height={40} className="rounded-full object-cover w-10 h-10 border border-[var(--color-turquoise)] shadow-[0_0_10px_var(--color-turquoise)]" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center text-white font-bold border border-[var(--color-turquoise)] shadow-[0_0_10px_var(--color-turquoise)]">
                                    {speaker.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-white">{speaker.name}</p>
                                  <p className="text-xs text-[var(--color-turquoise)]">{speaker.title || "Speaker"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Document Push */}
                      <AnimatePresence>
                        {liveState?.document_url && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-auto pt-4"
                          >
                            <Link
                              href={liveState.document_url}
                              target="_blank"
                              className="w-full flex items-center justify-between p-3 bg-[var(--color-turquoise)]/20 hover:bg-[var(--color-turquoise)]/40 border border-[var(--color-turquoise)] rounded-xl backdrop-blur-md transition-colors group/doc"
                            >
                              <div className="flex items-center gap-2 text-white">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-semibold">Live Resource</span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-white/70 group-hover/doc:text-white group-hover/doc:translate-x-1 transition-all" />
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                      <Zap className="w-12 h-12 mb-4 text-white/20" />
                      <p className="text-lg font-medium text-white">No Event Selected</p>
                      <p className="text-sm mt-1">Check back later or switch stages.</p>
                    </div>
                  )}
                </div>
              </motion.div>
        </div>
        </div>
      </section>

      {/* About Section (moved after live experience) */}
      <AboutSection />

      {/* General Sections */}
      <div className="mt-10">
        <Location locationMapUrl={siteSettings?.locationMapUrl} stages={stages} />
        <Schedule sessions={sessions} />
        <Speakers speakers={speakers?.filter((s: any) => s.featured)} />
        <Gallery galleryItems={galleryMedia} />
      </div>
    </motion.div>
  );
}
