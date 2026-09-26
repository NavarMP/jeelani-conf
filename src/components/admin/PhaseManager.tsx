'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

type Phase = 'pre' | 'on' | 'post';

export function PhaseManager() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('pre');
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchState();
    
    const channel = supabase
      .channel('phase-manager-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conference_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          setCurrentPhase(payload.new.current_phase as Phase);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchState = async () => {
    const { data } = await supabase
      .from('conference_settings')
      .select('current_phase')
      .eq('id', 1)
      .single();
    if (data) setCurrentPhase(data.current_phase);
  };

  const handlePhaseChange = async (phase: Phase) => {
    setIsUpdating(true);
    await supabase
      .from('conference_settings')
      .update({ current_phase: phase, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setCurrentPhase(phase);
    setIsUpdating(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold mb-6">Phase Control Center</h2>
      <p className="text-muted-foreground mb-8">
        Instantly switch the global state of the application. All connected users will experience a real-time animated transition.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'pre', label: 'Pre-Event (Hype & Registration)', color: 'from-blue-500 to-cyan-400' },
          { id: 'on', label: 'On-Event (Live Experience)', color: 'from-amber-400 to-orange-500' },
          { id: 'post', label: 'Post-Event (Wrap-up & Feedback)', color: 'from-fuchsia-500 to-purple-600' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => handlePhaseChange(p.id as Phase)}
            disabled={isUpdating}
            className={`relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
              currentPhase === p.id 
                ? 'ring-4 ring-primary shadow-xl scale-[1.02]' 
                : 'hover:scale-[1.01] hover:shadow-md bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            {currentPhase === p.id && (
              <motion.div 
                layoutId="active-phase"
                className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-20`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-lg font-bold">
                {p.label}
              </span>
              <span className="text-sm font-medium opacity-80">
                {currentPhase === p.id ? 'Active Phase' : 'Switch to this phase'}
              </span>
            </div>
            
            {currentPhase === p.id && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
