'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ArrowRight, CheckCircle2, Play, Download, Award, HeartHandshake } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function PostEventPhase({ props }: { props: any }) {
  const { galleryMedia, sessions } = props;
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getEmoji = (val: number) => {
    switch(val) {
      case 1: return '😞';
      case 2: return '😐';
      case 3: return '🙂';
      case 4: return '😄';
      case 5: return '🤩';
      default: return '🤩';
    }
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);
    const supabase = createClient();
    try {
      await supabase.from('feedback').insert([
        { rating, comments: feedbackText }
      ]);
    } catch (e) {
      // Ignore errors for now
    }
    
    // Simulate delay for smooth UI
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]); // Success haptic
      }
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
      className="min-h-[100dvh] bg-[#1a0b2e] text-white pt-24 pb-16 relative overflow-hidden flex flex-col"
    >
      {/* Sunset Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-orange-600/20 rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[150px] mix-blend-screen" 
        />
      </div>

      <div className="container-site relative z-10 space-y-20">
        
        {/* Grand Thank You Splash */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-10">
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center p-[2px] shadow-[0_0_50px_rgba(249,115,22,0.3)]"
          >
            <div className="w-full h-full bg-[#1a0b2e] rounded-full flex items-center justify-center">
              <HeartHandshake className="w-12 h-12 text-orange-400" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-pink-400 to-fuchsia-500 pb-2">
            A Journey Concluded
          </h1>
          <p className="text-xl md:text-2xl text-orange-100/70 font-medium leading-relaxed">
            The Grand Jeelani Conference has officially come to a close. We deeply appreciate your presence, participation, and spiritual devotion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button 
              onClick={() => {
                setShowFeedback(true);
                setFeedbackStep(1);
                setTimeout(() => document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
              Share Your Experience
            </button>
          </div>
        </section>

        {/* Interactive Feedback Survey */}
        <AnimatePresence>
          {showFeedback && (
            <motion.section 
              id="feedback-section"
              initial={{ opacity: 0, height: 0, y: 50 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  {/* STEP 1: Rating */}
                  {feedbackStep === 1 && !hasSubmitted && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="text-center space-y-8"
                    >
                      <h3 className="text-2xl font-bold">How was your experience?</h3>
                      
                      <div className="flex flex-col items-center gap-6">
                        <motion.div 
                          key={rating}
                          initial={{ scale: 0.5, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                          {getEmoji(rating)}
                        </motion.div>
                        
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={rating} 
                          onChange={(e) => setRating(parseInt(e.target.value))}
                          className="w-full max-w-xs accent-pink-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-full max-w-xs flex justify-between text-white/40 text-sm font-medium">
                          <span>Needs Work</span>
                          <span>Amazing</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setFeedbackStep(2)}
                        className="mt-8 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold transition-colors inline-flex items-center gap-2"
                      >
                        Next <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: Written Feedback */}
                  {feedbackStep === 2 && !hasSubmitted && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-6 text-center"
                    >
                      <h3 className="text-2xl font-bold">Any specific highlights?</h3>
                      <p className="text-white/60">Tell us what you loved or what we can improve.</p>
                      
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Your thoughts..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 min-h-[150px] text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none"
                      />
                      
                      <div className="flex gap-4 justify-center">
                        <button 
                          onClick={() => setFeedbackStep(1)}
                          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 font-bold transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          onClick={submitFeedback}
                          disabled={isSubmitting}
                          className="px-8 py-3 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-500 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SUCCESS */}
                  {hasSubmitted && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                        className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle2 className="w-10 h-10" />
                      </motion.div>
                      <h3 className="text-3xl font-bold">Thank You!</h3>
                      <p className="text-white/60">Your feedback helps us make the next conference even better.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* On-Demand Content Bento Grid */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Relive the Experience</h2>
            <p className="text-white/60">Access recordings, materials, and certificates on-demand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Video Highlights */}
            <div className="md:col-span-2 relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 group cursor-pointer aspect-video md:aspect-auto h-[300px]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <Play className="w-6 h-6 ml-1 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 pr-6">
                <h3 className="text-2xl font-bold">Conference Highlights</h3>
                <p className="text-white/70">Watch the official 4K aftermovie</p>
              </div>
            </div>

            {/* Resources */}
            <div className="rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 transition-all flex flex-col justify-between h-[300px] cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Slide Decks & Materials</h3>
                <p className="text-white/60 text-sm mb-4">Download presentation slides from all major sessions.</p>
                <span className="text-orange-400 font-medium text-sm flex items-center gap-1">Browse Files <ArrowRight className="w-4 h-4" /></span>
              </div>
            </div>

            {/* Certificates */}
            <div className="rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 transition-all flex flex-col justify-between h-[300px] cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Participant Certificates</h3>
                <p className="text-white/60 text-sm mb-4">Download your verified attendance certificate.</p>
                <span className="text-pink-400 font-medium text-sm flex items-center gap-1">Claim Certificate <ArrowRight className="w-4 h-4" /></span>
              </div>
            </div>

            {/* Gallery Link */}
            <div className="md:col-span-2 rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 transition-all flex items-center justify-between cursor-pointer">
              <div className="max-w-sm">
                <h3 className="text-xl font-bold mb-2">Photo Gallery</h3>
                <p className="text-white/60 text-sm">Browse hundreds of professional photos taken during the event.</p>
              </div>
              <div className="hidden sm:flex gap-[-10px]">
                {/* Simulated photo stack */}
                {[1,2,3].map(i => (
                  <div key={i} className={`w-16 h-16 rounded-lg bg-white/20 border-2 border-[#1a0b2e] shadow-lg -ml-4 rotate-[${(i-2)*5}deg]`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
