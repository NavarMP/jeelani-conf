'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';

export type Phase = 'pre' | 'on' | 'post';

interface PhaseState {
  currentPhase: Phase;
  autoSwitchEnabled: boolean;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  isLoading: boolean;
}

const PhaseContext = createContext<PhaseState>({
  currentPhase: 'pre',
  autoSwitchEnabled: false,
  scheduledStartTime: null,
  scheduledEndTime: null,
  isLoading: true,
});

export const usePhase = () => useContext(PhaseContext);

export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PhaseState>({
    currentPhase: 'pre',
    autoSwitchEnabled: false,
    scheduledStartTime: null,
    scheduledEndTime: null,
    isLoading: true,
  });

  const [transitioning, setTransitioning] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<Phase | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchInitialState = async () => {
      const { data, error } = await supabase
        .from('conference_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setState({
          currentPhase: data.current_phase as Phase,
          autoSwitchEnabled: data.auto_switch_enabled,
          scheduledStartTime: data.scheduled_start_time,
          scheduledEndTime: data.scheduled_end_time,
          isLoading: false,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };

    fetchInitialState();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('phase-provider-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conference_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const newPhase = payload.new.current_phase as Phase;
          
          setState((prevState) => {
            if (prevState.currentPhase !== newPhase) {
              // Trigger transition animation and haptics
              if (typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Haptic feedback
              }
              setOverlayPhase(newPhase);
              setTransitioning(true);
              
              // Hide overlay after animation
              setTimeout(() => {
                setTransitioning(false);
              }, 2500);
            }
            
            return {
              currentPhase: newPhase,
              autoSwitchEnabled: payload.new.auto_switch_enabled,
              scheduledStartTime: payload.new.scheduled_start_time,
              scheduledEndTime: payload.new.scheduled_end_time,
              isLoading: false,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PhaseContext.Provider value={state}>
      {/* Global Phase Transition Overlay */}
      <AnimatePresence>
        {transitioning && overlayPhase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl text-white"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                {overlayPhase === 'pre' && 'Preparing for the Event...'}
                {overlayPhase === 'on' && 'The Event is Now Live'}
                {overlayPhase === 'post' && 'Thank You for Attending'}
              </h1>
              <p className="text-xl text-gray-400">Please wait while we set the stage.</p>
              
              <div className="mt-8 flex justify-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </PhaseContext.Provider>
  );
}
