"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Download, Search, CheckCircle2, XCircle } from "lucide-react";

export default function QuizEntriesManager() {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const supabase = createClient();

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("quiz_entries")
      .select(`
        id,
        is_correct,
        created_at,
        quiz_participants ( name, email, phone ),
        quiz_questions ( question_text ),
        quiz_locations ( name )
      `)
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter(e => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    const p = e.quiz_participants;
    return (
      (p?.name || "").toLowerCase().includes(s) ||
      (p?.email || "").toLowerCase().includes(s) ||
      (p?.phone || "").toLowerCase().includes(s) ||
      (e.quiz_locations?.name || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Quiz Entries</h2>
          <p className="text-white/60 text-sm">Monitor participant submissions in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="Search participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)] text-sm w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => alert("CSV Export coming soon!")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Total Entries</div>
            <div className="text-3xl font-bold text-white">{entries.length}</div>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-green-500/70 text-xs font-bold uppercase tracking-wider mb-1">Correct Answers</div>
            <div className="text-3xl font-bold text-green-400">
              {entries.filter(e => e.is_correct).length}
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-red-500/70 text-xs font-bold uppercase tracking-wider mb-1">Incorrect Answers</div>
            <div className="text-3xl font-bold text-red-400">
              {entries.filter(e => !e.is_correct).length}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise)]" />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Time</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Participant</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Location & Question</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40">No entries found.</td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-xs text-white/60 whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{entry.quiz_participants?.name || 'Anonymous'}</div>
                        <div className="text-xs text-white/50">{entry.quiz_participants?.phone}</div>
                        {entry.quiz_participants?.email && <div className="text-xs text-white/40">{entry.quiz_participants.email}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-[var(--color-turquoise)] mb-0.5 uppercase tracking-wider">
                          {entry.quiz_locations?.name}
                        </div>
                        <div className="text-sm text-white/80 line-clamp-2 leading-snug">
                          {entry.quiz_questions?.question_text}
                        </div>
                      </td>
                      <td className="p-4">
                        {entry.is_correct ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
