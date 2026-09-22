"use client";

import { useState, useEffect } from "react";
import { createClient } from "./supabase/client";

export type Session = {
  id: string; // we'll map slug to id for backward compatibility
  slug: string;
  label: string; // mapped from title
  title: string;
  isRegistrationOpen: boolean; // mapped from is_open for backward compatibility
  status: 'open' | 'closed' | 'temporarily_closed' | 'scheduled';
  scheduledOpenTime: string | null;
  scheduledCloseTime: string | null;
  customClosedMessage: string | null;
  isArchived: boolean;
  createdAt: string;
};

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_sessions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted: Session[] = data.map(s => ({
          id: s.slug,
          slug: s.slug,
          label: s.title,
          title: s.title,
          isRegistrationOpen: s.status === 'open' || s.is_open, // fallback for backward compatibility
          status: s.status || (s.is_open ? 'open' : 'closed'),
          scheduledOpenTime: s.scheduled_open_time,
          scheduledCloseTime: s.scheduled_close_time,
          customClosedMessage: s.custom_closed_message,
          isArchived: s.is_archived,
          createdAt: s.created_at,
        }));
        setSessions(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch sessions from Supabase:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const addSession = async (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      const { error } = await supabase
        .from('registration_sessions')
        .insert([{ slug, title, is_open: false, is_archived: false }]);

      if (error) throw error;
      await fetchSessions(); // Refresh list
    } catch (error) {
      console.error("Failed to add session:", error);
      alert("Failed to add session. See console.");
    }
  };

  const toggleRegistration = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registration_sessions')
        .update({ 
          is_open: !currentStatus,
          status: !currentStatus ? 'open' : 'closed' 
        })
        .eq('slug', id);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error("Failed to toggle registration:", error);
    }
  };

  const updateSessionAdvancedStatus = async (
    id: string, 
    payload: { 
      status: Session['status'], 
      scheduledOpenTime?: string | null, 
      scheduledCloseTime?: string | null, 
      customClosedMessage?: string | null 
    }
  ) => {
    try {
      const { error } = await supabase
        .from('registration_sessions')
        .update({
          status: payload.status,
          is_open: payload.status === 'open',
          scheduled_open_time: payload.scheduledOpenTime,
          scheduled_close_time: payload.scheduledCloseTime,
          custom_closed_message: payload.customClosedMessage
        })
        .eq('slug', id);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error("Failed to update advanced session status:", error);
      throw error;
    }
  };

  const toggleArchive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registration_sessions')
        .update({ is_archived: !currentStatus })
        .eq('slug', id);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registration_sessions')
        .delete()
        .eq('slug', id);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const activeSessions = sessions.filter(s => !s.isArchived);

  return {
    sessions,
    activeSessions,
    isLoaded,
    addSession,
    toggleRegistration,
    updateSessionAdvancedStatus,
    toggleArchive,
    deleteSession,
    refresh: fetchSessions
  };
}
