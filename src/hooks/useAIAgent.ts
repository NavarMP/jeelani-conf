"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface AgentMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

const STORAGE_KEY = "gjc-agent-history";
const MAX_HISTORY = 50;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadHistory(): AgentMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(messages: AgentMessage[]) {
  if (typeof window === "undefined") return;
  try {
    // Only persist non-streaming messages
    const toSave = messages
      .filter((m) => !m.isStreaming)
      .slice(-MAX_HISTORY);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function useAIAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  // Load history on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const history = loadHistory();
      if (history.length > 0) {
        setMessages(history);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (hasLoadedRef.current && messages.length > 0) {
      saveHistory(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string, locale: string = "en") => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      // Add user message
      const userMessage: AgentMessage = {
        id: generateId(),
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      // Create placeholder for AI response
      const aiMessageId = generateId();
      const aiMessage: AgentMessage = {
        id: aiMessageId,
        role: "model",
        text: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setIsStreaming(true);

      // Build conversation for API
      const conversationMessages = [
        ...messages
          .filter((m) => !m.isStreaming)
          .map((m) => ({ role: m.role, text: m.text })),
        { role: "user" as const, text: text.trim() },
      ];

      // Create abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationMessages,
            locale,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, text: accumulated }
                      : m
                  )
                );
              }
            } catch (e: any) {
              if (e.message && !e.message.includes("JSON")) {
                throw e;
              }
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, isStreaming: false, timestamp: Date.now() }
              : m
          )
        );
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User cancelled
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId
                ? {
                    ...m,
                    text: m.text || "Response cancelled.",
                    isStreaming: false,
                  }
                : m
            )
          );
        } else {
          setError(err.message || "Something went wrong");
          // Remove the empty AI message on error
          setMessages((prev) =>
            prev.filter((m) => m.id !== aiMessageId)
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, messages]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    messages,
    isOpen,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearHistory,
    toggleOpen,
    open,
    close,
  };
}
