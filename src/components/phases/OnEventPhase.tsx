'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, Star, MessageCircle, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function OnEventPhase({ props }: { props: any }) {
  const { liveStreams } = props;
  const stageKeys = liveStreams ? Object.keys(liveStreams).sort() : [];
  const [activeStage, setActiveStage] = useState<string>(stageKeys[0] || "stage1");
  const stream = liveStreams ? liveStreams[activeStage] || {} : {};
  
  const [reactions, setReactions] = useState<{id: number, type: string, x: number}[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  
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
      case 'heart': return <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />;
      case 'thumb': return <ThumbsUp className="w-8 h-8 text-blue-400 fill-blue-400" />;
      case 'star': return <Star className="w-8 h-8 text-amber-400 fill-amber-400" />;
      default: return <Heart className="w-8 h-8 text-pink-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
      className="min-h-[100dvh] bg-[#020617] text-white pt-20 pb-10 relative overflow-hidden flex flex-col"
    >
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="container-site relative z-10 flex-1 flex flex-col">
        {/* Header & Stage Selection */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
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
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
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
                  <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                  Stream starting soon...
                </div>
              )}
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <div className="flex gap-3">
                <button 
                  onClick={() => triggerReaction('heart')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Heart className="w-5 h-5 text-pink-500" />
                </button>
                <button 
                  onClick={() => triggerReaction('thumb')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <ThumbsUp className="w-5 h-5 text-blue-400" />
                </button>
                <button 
                  onClick={() => triggerReaction('star')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className="w-5 h-5 text-amber-400" />
                </button>
              </div>
              
              <button 
                onClick={() => setShowQuiz(!showQuiz)}
                className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${
                  showQuiz 
                    ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Zap className="w-5 h-5" />
                {showQuiz ? 'Close Quiz' : 'Join Live Quiz'}
              </button>
            </div>
          </div>

          {/* Right: Interactive Sidebar (Quiz / Chat) */}
          <AnimatePresence mode="wait">
            {showQuiz ? (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, filter: 'blur(5px)' }}
                className="w-full lg:w-[400px] h-[600px] lg:h-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
              >
                {/* Embed the existing quiz app using an iframe to the dedicated route, passing a special live slug */}
                {/* We assume there is a special location slug 'live-stream' created in the DB */}
                <iframe 
                  src="/en/quiz?loc=live-stream" 
                  className="w-full h-full border-none"
                  title="Live Quiz"
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full lg:w-[400px] h-[600px] lg:h-auto bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold">Live Reactions</h3>
                </div>
                
                <div className="flex-1 relative flex flex-col justify-end">
                  <p className="text-white/40 text-center text-sm absolute inset-0 flex items-center justify-center pointer-events-none">
                    Send a reaction using the buttons below!
                  </p>
                  
                  {/* Floating Reactions Container */}
                  <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none overflow-hidden">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
