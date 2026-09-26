"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit, Loader2, Save, List, CheckCircle2 } from "lucide-react";

interface QuizLocation {
  id: string;
  name: string;
}

interface QuizAnswer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  location_id: string;
  question_text: string;
  question_type: string;
  is_active: boolean;
  order_index: number;
  quiz_answers?: QuizAnswer[];
}

export default function QuizQuestionsManager() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [locations, setLocations] = useState<QuizLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuizQuestion>>({});
  const [editAnswers, setEditAnswers] = useState<QuizAnswer[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const [locationFilter, setLocationFilter] = useState<string>("all");

  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch locations for filter and dropdowns
    const { data: locData } = await supabase.from("quiz_locations").select("id, name");
    if (locData) setLocations(locData);

    // Fetch questions with answers
    let query = supabase
      .from("quiz_questions")
      .select("*, quiz_answers(*)")
      .order("order_index", { ascending: true });
      
    if (locationFilter !== "all") {
      query = query.eq("location_id", locationFilter);
    }
    
    const { data: qData, error } = await query;
    if (!error && qData) {
      // Sort answers by order_index manually
      const sortedData = qData.map((q: any) => ({
        ...q,
        quiz_answers: q.quiz_answers?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      }));
      setQuestions(sortedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [locationFilter]);

  const handleSave = async () => {
    if (!editForm.location_id || !editForm.question_text) {
      alert("Please fill in location and question text.");
      return;
    }

    try {
      let currentQuestionId = isEditing;
      
      if (isCreating) {
        const { data, error } = await supabase.from("quiz_questions").insert([{ 
          location_id: editForm.location_id,
          question_text: editForm.question_text,
          question_type: editForm.question_type || 'multiple_choice',
          is_active: editForm.is_active ?? true,
          order_index: editForm.order_index || 0
        }]).select().single();
        
        if (error) throw error;
        currentQuestionId = data.id;
      } else if (isEditing) {
        const { error } = await supabase.from("quiz_questions").update({
          location_id: editForm.location_id,
          question_text: editForm.question_text,
          question_type: editForm.question_type,
          is_active: editForm.is_active,
          order_index: editForm.order_index
        }).eq("id", isEditing);
        if (error) throw error;
      }

      // Handle Answers
      if (currentQuestionId) {
        // First delete all existing answers for this question
        await supabase.from("quiz_answers").delete().eq("question_id", currentQuestionId);
        
        // Then insert the new ones
        if (editAnswers.length > 0) {
          const answersToInsert = editAnswers.map(a => ({
            question_id: currentQuestionId,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            order_index: a.order_index
          }));
          await supabase.from("quiz_answers").insert(answersToInsert);
        }
      }

      setIsCreating(false);
      setIsEditing(null);
      setEditForm({});
      setEditAnswers([]);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Failed to save: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (!error) fetchData();
    }
  };

  const startEdit = (q: QuizQuestion) => {
    setIsEditing(q.id);
    setEditForm(q);
    setEditAnswers(q.quiz_answers || []);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({ 
      location_id: locations.length > 0 ? locations[0].id : "", 
      question_text: "", 
      question_type: "multiple_choice",
      is_active: true,
      order_index: questions.length
    });
    setEditAnswers([
      { answer_text: "", is_correct: true, order_index: 0 },
      { answer_text: "", is_correct: false, order_index: 1 },
      { answer_text: "", is_correct: false, order_index: 2 },
      { answer_text: "", is_correct: false, order_index: 3 },
    ]);
  };

  const updateAnswer = (index: number, field: keyof QuizAnswer, value: any) => {
    const newAnswers = [...editAnswers];
    if (field === 'is_correct') {
      // If setting this one to correct, unset others (assuming single correct answer for now)
      newAnswers.forEach(a => a.is_correct = false);
    }
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setEditAnswers(newAnswers);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Question Bank</h2>
          <p className="text-white/60 text-sm">Manage questions and multiple choice options.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)]"
          >
            <option value="all" className="bg-[#0f172a]">All Locations</option>
            {locations.map(l => (
              <option key={l.id} value={l.id} className="bg-[#0f172a]">{l.name}</option>
            ))}
          </select>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 text-[var(--color-navy)] font-bold rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            {isCreating ? "Create New Question" : "Edit Question"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Question Text</label>
              <textarea 
                value={editForm.question_text || ""} 
                onChange={(e) => setEditForm({...editForm, question_text: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)] min-h-[80px]"
                placeholder="What is..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Location</label>
              <select 
                value={editForm.location_id || ""}
                onChange={(e) => setEditForm({...editForm, location_id: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)]"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0f172a]">{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input 
                type="checkbox" 
                id="q_is_active"
                checked={editForm.is_active || false} 
                onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--color-turquoise)]"
              />
              <label htmlFor="q_is_active" className="text-sm font-medium text-white/80">Active (Visible to users)</label>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mb-6">
            <h4 className="text-sm font-bold text-white mb-3">Answers / Options</h4>
            <div className="space-y-3">
              {editAnswers.map((answer, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${answer.is_correct ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5'}`}>
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={answer.is_correct}
                    onChange={() => updateAnswer(idx, 'is_correct', true)}
                    className="w-4 h-4 text-green-500 shrink-0"
                    title="Mark as correct answer"
                  />
                  <input 
                    type="text"
                    value={answer.answer_text}
                    onChange={(e) => updateAnswer(idx, 'answer_text', e.target.value)}
                    className="w-full bg-transparent border-none text-white focus:outline-none text-sm"
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => { setIsCreating(false); setIsEditing(null); }}
              className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 text-[var(--color-navy)] font-bold rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Question
            </button>
          </div>
        </div>
      )}

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
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider w-[40px]">#</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Question & Location</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Answers</th>
                  <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40">No questions found.</td>
                  </tr>
                ) : (
                  questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white/40 font-mono text-xs">{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-white mb-1 leading-snug">{q.question_text}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">
                            {locations.find(l => l.id === q.location_id)?.name || "Unknown"}
                          </span>
                          {!q.is_active && (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-400/10 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {q.quiz_answers?.map(a => (
                            <div key={a.id} className={`text-xs flex items-center gap-1.5 ${a.is_correct ? 'text-green-400 font-medium' : 'text-white/40'}`}>
                              {a.is_correct && <CheckCircle2 className="w-3 h-3" />}
                              {a.answer_text}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(q)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
