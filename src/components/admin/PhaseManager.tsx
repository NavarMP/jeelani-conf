'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

type Phase = 'pre' | 'on' | 'post' | 'maintenance';

export function PhaseManager() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('pre');
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
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
          setAutoSwitch(payload.new.auto_switch_enabled);
          setStartTime(payload.new.scheduled_start_time ? payload.new.scheduled_start_time.slice(0, 16) : '');
          setEndTime(payload.new.scheduled_end_time ? payload.new.scheduled_end_time.slice(0, 16) : '');
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
      .select('current_phase, auto_switch_enabled, scheduled_start_time, scheduled_end_time')
      .eq('id', 1)
      .single();
    if (data) {
      setCurrentPhase(data.current_phase);
      setAutoSwitch(data.auto_switch_enabled);
      setStartTime(data.scheduled_start_time ? data.scheduled_start_time.slice(0, 16) : '');
      setEndTime(data.scheduled_end_time ? data.scheduled_end_time.slice(0, 16) : '');
    }
  };

  const handleSaveAutoSettings = async () => {
    setIsUpdating(true);
    await supabase
      .from('conference_settings')
      .update({ 
        auto_switch_enabled: autoSwitch,
        scheduled_start_time: startTime ? new Date(startTime).toISOString() : null,
        scheduled_end_time: endTime ? new Date(endTime).toISOString() : null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', 1);
    setIsUpdating(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'pre', label: 'Pre-Event (Hype & Registration)', color: 'from-blue-500 to-cyan-400' },
          { id: 'on', label: 'On-Event (Live Experience)', color: 'from-amber-400 to-orange-500' },
          { id: 'post', label: 'Post-Event (Wrap-up & Feedback)', color: 'from-fuchsia-500 to-purple-600' },
          { id: 'maintenance', label: 'Maintenance Mode', color: 'from-indigo-500 to-violet-600' }
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

      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-xl font-bold mb-4">Automatic Phase Switching</h3>
        <p className="text-muted-foreground mb-6">
          Enable automatic switching to smoothly transition between phases at exactly the right time. Manual switches will still work, but may be overridden by the auto-scheduler.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-2xl flex flex-col gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoSwitch}
              onChange={(e) => setAutoSwitch(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-300 text-[var(--color-brass)] focus:ring-[var(--color-brass)]"
            />
            <span className="font-semibold">Enable Auto-Switching</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Scheduled Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!autoSwitch}
                className="px-4 py-2 rounded-lg border border-border bg-white dark:bg-zinc-900 disabled:opacity-50"
              />
              <span className="text-xs text-muted-foreground">When the Pre-Event switches to Live</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Scheduled End Time</label>
              <input 
                type="datetime-local" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!autoSwitch}
                className="px-4 py-2 rounded-lg border border-border bg-white dark:bg-zinc-900 disabled:opacity-50"
              />
              <span className="text-xs text-muted-foreground">When Live switches to Post-Event</span>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveAutoSettings}
              disabled={isUpdating}
              className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
