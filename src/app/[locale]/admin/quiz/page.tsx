"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Loader2, Users, MapPin, Target, GraduationCap } from "lucide-react";
import Link from 'next/link';

export default function QuizDashboardPage() {
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalQuestions: 0,
    totalParticipants: 0,
    totalEntries: 0,
    correctRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      
      const [
        { count: locCount },
        { count: qCount },
        { count: pCount },
        { data: entries }
      ] = await Promise.all([
        supabase.from('quiz_locations').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_questions').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_participants').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_entries').select('is_correct')
      ]);

      const correctCount = entries?.filter(e => e.is_correct).length || 0;
      const entryCount = entries?.length || 0;
      const rate = entryCount > 0 ? Math.round((correctCount / entryCount) * 100) : 0;

      setStats({
        totalLocations: locCount || 0,
        totalQuestions: qCount || 0,
        totalParticipants: pCount || 0,
        totalEntries: entryCount,
        correctRate: rate
      });
      
      setIsLoading(false);
    }
    
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Quiz Intelligence</h1>
        <p className="text-white/60">Overview of your interactive conference quiz.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--color-turquoise)]/20 rounded-lg">
              <MapPin className="w-5 h-5 text-[var(--color-turquoise)]" />
            </div>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Locations</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.totalLocations}</div>
          <Link href="/admin/quiz/locations" className="text-xs text-[var(--color-turquoise)] mt-3 inline-block hover:underline">Manage Locations &rarr;</Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--color-brass)]/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[var(--color-brass)]" />
            </div>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Questions</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.totalQuestions}</div>
          <Link href="/admin/quiz/questions" className="text-xs text-[var(--color-brass)] mt-3 inline-block hover:underline">Manage Bank &rarr;</Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Participants</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.totalParticipants}</div>
          <div className="text-xs text-white/40 mt-3 inline-block">Unique attendees</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Avg Accuracy</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.correctRate}%</div>
          <Link href="/admin/quiz/entries" className="text-xs text-green-400 mt-3 inline-block hover:underline">View {stats.totalEntries} Entries &rarr;</Link>
        </div>
      </div>
      
      <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-8">
        <h3 className="text-lg font-bold text-white mb-2">Getting Started</h3>
        <ul className="list-disc list-inside text-white/70 space-y-2 text-sm">
          <li>Create physical <Link href="/admin/quiz/locations" className="text-[var(--color-turquoise)] hover:underline">Locations</Link> representing spots in the conference (e.g., Main Stage, Exhibition Hall).</li>
          <li>Populate the <Link href="/admin/quiz/questions" className="text-[var(--color-turquoise)] hover:underline">Question Bank</Link> and assign questions to those locations.</li>
          <li>Copy the QR link from the Locations page and convert it into QR codes using an external tool or printer.</li>
          <li>Stick the QR codes at their respective locations. When attendees scan them, they will only see questions mapped to that specific spot!</li>
        </ul>
      </div>
    </div>
  );
}
