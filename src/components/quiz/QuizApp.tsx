"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Trophy, ScanLine, AlertCircle } from "lucide-react";

// Types
interface Location {
  id: string;
  name: string;
  slug: string;
}

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  quiz_answers: Answer[];
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
}

type QuizState = 'loading' | 'error' | 'splash' | 'onboarding' | 'playing' | 'results';

export default function QuizApp() {
  const searchParams = useSearchParams();
  const locSlug = searchParams.get("loc");
  
  const [appState, setAppState] = useState<QuizState>('loading');
  const [errorMsg, setErrorMsg] = useState("");
  
  const [location, setLocation] = useState<Location | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  // Onboarding form
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const supabase = createClient();

  // Haptic Helper
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const initQuiz = async () => {
      if (!locSlug) {
        setErrorMsg("No location specified. Please scan a valid QR code.");
        setAppState('error');
        return;
      }

      // 1. Fetch location
      const { data: locData, error: locError } = await supabase
        .from('quiz_locations')
        .select('*')
        .eq('slug', locSlug)
        .eq('is_active', true)
        .single();
        
      if (locError || !locData) {
        setErrorMsg("Invalid or inactive location. Please try scanning the QR code again.");
        setAppState('error');
        return;
      }
      setLocation(locData);

      // 2. Fetch questions
      const { data: qData, error: qError } = await supabase
        .from('quiz_questions')
        .select('id, question_text, quiz_answers(id, answer_text, is_correct, order_index)')
        .eq('location_id', locData.id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (qError || !qData || qData.length === 0) {
        setErrorMsg("No active questions found for this location.");
        setAppState('error');
        return;
      }
      
      // Sort answers for each question
      const sortedQData = qData.map(q => ({
        ...q,
        quiz_answers: q.quiz_answers.sort((a: any, b: any) => a.order_index - b.order_index)
      }));
      
      setQuestions(sortedQData);
      setAppState('splash');
    };

    initQuiz();
  }, [locSlug]);

  const handleStartOnboarding = () => {
    triggerHaptic(50);
    setAppState('onboarding');
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    
    triggerHaptic(50);
    setAppState('loading');
    
    // Create participant
    const { data, error } = await supabase
      .from('quiz_participants')
      .insert([{ name: form.name, phone: form.phone, email: form.email }])
      .select()
      .single();
      
    if (error) {
      alert("Failed to register. Please try again.");
      setAppState('onboarding');
      return;
    }
    
    setParticipant(data);
    setAppState('playing');
  };

  const handleSelectAnswer = async (ans: Answer) => {
    if (isAnswerRevealed || !participant || !location) return;
    
    setSelectedAnswerId(ans.id);
    setIsAnswerRevealed(true);
    
    const isCorrect = ans.is_correct;
    
    // Haptics for correct/incorrect
    if (isCorrect) {
      triggerHaptic([30, 50, 30]); // Success feel
      setScore(s => s + 1);
    } else {
      triggerHaptic([100, 50, 100]); // Error feel
    }
    
    // Submit entry to DB
    await supabase.from('quiz_entries').insert([{
      participant_id: participant.id,
      question_id: questions[currentQIdx].id,
      selected_answer_id: ans.id,
      location_id: location.id,
      is_correct: isCorrect
    }]);

    // Wait and proceed
    setTimeout(() => {
      if (currentQIdx < questions.length - 1) {
        setCurrentQIdx(prev => prev + 1);
        setSelectedAnswerId(null);
        setIsAnswerRevealed(false);
      } else {
        setAppState('results');
        triggerHaptic([50, 50, 50, 50, 100]); // Celebrate
      }
    }, 2000);
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------
  
  const Background = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#050505]" />
      <motion.div 
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -inset-[100%] opacity-40 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-turquoise) 0%, transparent 40%), radial-gradient(circle at 80% 20%, var(--color-brass) 0%, transparent 30%)',
          filter: 'blur(80px)'
        }}
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );

  return (
    <>
      <Background />
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          
          {/* LOADING STATE */}
          {appState === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 animate-spin text-[var(--color-turquoise)]" />
              <p className="text-white/60 tracking-widest uppercase text-sm font-bold animate-pulse">Initializing Interface</p>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {appState === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl text-center w-full"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-200/80 mb-6">{errorMsg}</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                Scan Again
              </button>
            </motion.div>
          )}

          {/* SPLASH STATE */}
          {appState === 'splash' && location && (
            <motion.div 
              key="splash"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl">
                <ScanLine className="w-10 h-10 text-[var(--color-turquoise)]" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-[var(--color-brass)] uppercase tracking-[0.2em] text-xs font-bold mb-3">Location Unlocked</h3>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  {location.name}
                </h1>
                <p className="text-white/60 text-lg mb-10 max-w-sm mx-auto">
                  Test your knowledge related to this specific zone and climb the leaderboard!
                </p>
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartOnboarding}
                className="group relative w-full overflow-hidden rounded-2xl bg-white text-black font-bold text-lg py-5 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Enter Challenge
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-brass)] opacity-0 group-hover:opacity-20 transition-opacity" />
              </motion.button>
            </motion.div>
          )}

          {/* ONBOARDING STATE */}
          {appState === 'onboarding' && (
            <motion.form 
              key="onboarding"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onSubmit={handleSubmitOnboarding}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Identify Yourself</h2>
                <p className="text-white/50 text-sm">We need this to track your score on the leaderboard.</p>
              </div>
              
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)] transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input 
                    required
                    type="tel" 
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)] transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)] transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 rounded-xl bg-[var(--color-turquoise)] text-black font-bold text-lg shadow-[0_0_20px_var(--color-turquoise)]/30 hover:shadow-[0_0_30px_var(--color-turquoise)]/50 transition-shadow flex justify-center items-center"
              >
                Start Quiz
              </motion.button>
            </motion.form>
          )}

          {/* PLAYING STATE */}
          {appState === 'playing' && questions.length > 0 && (
            <motion.div 
              key={`question-${currentQIdx}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="w-full flex flex-col"
            >
              {/* Progress */}
              <div className="w-full flex items-center gap-4 mb-8">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: `${(currentQIdx / questions.length) * 100}%` }}
                    animate={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
                    className="h-full bg-[var(--color-turquoise)]"
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs font-bold text-white/50 tracking-widest uppercase">
                  {currentQIdx + 1} / {questions.length}
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-turquoise)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-2 relative z-10">
                  {questions[currentQIdx].question_text}
                </h2>
              </div>

              {/* Answers */}
              <div className="flex flex-col gap-3">
                {questions[currentQIdx].quiz_answers.map((ans, idx) => {
                  const isSelected = selectedAnswerId === ans.id;
                  const isCorrect = ans.is_correct;
                  
                  let stateClass = "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30";
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      stateClass = "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-green-100 z-10";
                    } else if (isSelected && !isCorrect) {
                      stateClass = "bg-red-500/20 border-red-500 text-red-100 opacity-80";
                    } else {
                      stateClass = "bg-white/5 border-white/5 text-white/40 opacity-50";
                    }
                  }

                  return (
                    <motion.button
                      key={ans.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, type: "spring" }}
                      whileHover={!isAnswerRevealed ? { scale: 1.02 } : {}}
                      whileTap={!isAnswerRevealed ? { scale: 0.98 } : {}}
                      onClick={() => handleSelectAnswer(ans)}
                      disabled={isAnswerRevealed}
                      className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 font-medium sm:text-lg flex items-center justify-between overflow-hidden ${stateClass}`}
                    >
                      <span className="relative z-10 pr-8 leading-snug">{ans.answer_text}</span>
                      
                      {/* Status Icon */}
                      <div className="absolute right-5 z-10 flex items-center justify-center">
                        <AnimatePresence>
                          {isAnswerRevealed && isCorrect && (
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="text-green-400 bg-green-500/20 rounded-full p-1">
                              <CheckCircle2 className="w-6 h-6" />
                            </motion.div>
                          )}
                          {isAnswerRevealed && isSelected && !isCorrect && (
                            <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} className="text-red-400 bg-red-500/20 rounded-full p-1">
                              <XCircle className="w-6 h-6" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Correct Highlight Sweep */}
                      {isAnswerRevealed && isCorrect && (
                        <motion.div 
                          initial={{ left: "-100%" }}
                          animate={{ left: "100%" }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {appState === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.7, delay: 0.2 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-turquoise)] to-[var(--color-brass)] p-[2px]"
                >
                  <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center relative overflow-hidden">
                    <Trophy className="w-12 h-12 text-[var(--color-brass)] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brass)]/20 to-transparent" />
                  </div>
                </motion.div>
                
                {/* Score badge */}
                <motion.div 
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                  className="absolute -bottom-3 -right-3 bg-white text-black font-bold px-4 py-1.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] text-lg border-4 border-[#050505]"
                >
                  {score}/{questions.length}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete!</h2>
                <p className="text-white/60 mb-10 max-w-sm mx-auto">
                  {score === questions.length 
                    ? "Flawless victory! You really know your stuff. Head to the helpdesk to claim your badge." 
                    : "Great effort! Your score has been recorded on the global leaderboard."}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all"
              >
                Return to Home
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}
