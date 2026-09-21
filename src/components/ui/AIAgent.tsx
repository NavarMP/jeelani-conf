"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X,
  Send,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Square,
  RotateCcw,
} from "lucide-react";
import { useAIAgent, type AgentMessage } from "@/hooks/useAIAgent";
import { haptic } from "@/lib/haptics";
import { AIAgentFAB } from "./AIAgentFAB";

/* ── Suggestion Chips ──────────────────────────────────────────────────── */

const SUGGESTION_CHIPS = [
  { key: "schedule", emoji: "📅" },
  { key: "speakers", emoji: "🎤" },
  { key: "register", emoji: "🎫" },
  { key: "directions", emoji: "📍" },
  { key: "live", emoji: "📺" },
  { key: "language", emoji: "🌐" },
];

/* ── Typing Indicator ──────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="agent-typing-indicator">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ── Copy Button ───────────────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      haptic("tap");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="agent-copy-btn"
      aria-label="Copy message"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

/* ── Message Bubble ────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`agent-message ${isUser ? "agent-message--user" : "agent-message--ai"}`}
    >
      {!isUser && (
        <div className="agent-message__avatar">
          <Sparkles size={14} />
        </div>
      )}
      <div className={`agent-message__bubble ${isUser ? "agent-bubble--user" : "agent-bubble--ai"}`}>
        {isUser ? (
          <p>{message.text}</p>
        ) : message.text ? (
          <div className="agent-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
            {message.isStreaming && <span className="agent-cursor" />}
          </div>
        ) : (
          <TypingIndicator />
        )}
        {!isUser && message.text && !message.isStreaming && (
          <CopyButton text={message.text} />
        )}
      </div>
      <div className="agent-message__time">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </motion.div>
  );
}

/* ── Main Agent Component ──────────────────────────────────────────────── */

export function AIAgent() {
  const t = useTranslations("Agent");
  const locale = useLocale();
  const {
    messages,
    isOpen,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearHistory,
    toggleOpen,
    close,
  } = useAIAgent();

  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  // Scroll on new messages or streaming updates
  useEffect(() => {
    if (!showScrollBtn) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, showScrollBtn]);

  // Track scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd/Ctrl + J
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleOpen]);

  // Send message
  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    haptic("tap");
    sendMessage(input, locale);
    setInput("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, isStreaming, sendMessage, locale]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Suggestion chip click
  const handleChip = (chipKey: string) => {
    haptic("tap");
    const chipText = t(`chips.${chipKey}`);
    sendMessage(chipText, locale);
  };

  // Clear history
  const handleClear = () => {
    haptic("tap");
    clearHistory();
    setShowClearConfirm(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* FAB */}
      <AIAgentFAB
        isOpen={isOpen}
        onClick={() => {
          haptic("tap");
          toggleOpen();
        }}
        hasUnread={!isOpen && messages.length > 0 && messages[messages.length - 1]?.role === "model" && !messages[messages.length - 1]?.isStreaming}
      />

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="agent-backdrop"
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="agent-panel"
              role="dialog"
              aria-label={t("title")}
            >
              {/* ── Header ──────────────────────────────────── */}
              <div className="agent-header">
                <div className="agent-header__info">
                  <div className="agent-header__icon">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="agent-header__title">{t("title")}</h2>
                    <p className="agent-header__subtitle">
                      {isStreaming ? t("thinking") : t("subtitle")}
                    </p>
                  </div>
                </div>
                <div className="agent-header__actions">
                  {hasMessages && (
                    <button
                      onClick={() => {
                        haptic("tap");
                        setShowClearConfirm(true);
                      }}
                      className="agent-header__btn"
                      aria-label={t("clear")}
                      title={t("clear")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      haptic("tap");
                      close();
                    }}
                    className="agent-header__btn"
                    aria-label={t("close")}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* ── Clear Confirmation ──────────────────────── */}
              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="agent-clear-confirm"
                  >
                    <p>Clear all messages?</p>
                    <div className="agent-clear-confirm__actions">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="agent-clear-confirm__btn agent-clear-confirm__btn--cancel"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClear}
                        className="agent-clear-confirm__btn agent-clear-confirm__btn--confirm"
                      >
                        Clear
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Messages Area ──────────────────────────── */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="agent-messages"
              >
                {/* Welcome message when empty */}
                {!hasMessages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="agent-welcome"
                  >
                    <div className="agent-welcome__icon">
                      <Sparkles size={28} />
                    </div>
                    <h3 className="agent-welcome__title">{t("title")}</h3>
                    <p className="agent-welcome__text">{t("welcome")}</p>

                    {/* Suggestion Chips */}
                    <div className="agent-chips">
                      {SUGGESTION_CHIPS.map((chip) => (
                        <motion.button
                          key={chip.key}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleChip(chip.key)}
                          className="agent-chip"
                        >
                          <span className="agent-chip__emoji">
                            {chip.emoji}
                          </span>
                          <span className="agent-chip__text">
                            {t(`chips.${chip.key}`)}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="agent-error"
                  >
                    <p>{error}</p>
                    <button
                      onClick={() => {
                        // Retry last user message
                        const lastUser = [...messages]
                          .reverse()
                          .find((m) => m.role === "user");
                        if (lastUser) {
                          sendMessage(lastUser.text, locale);
                        }
                      }}
                      className="agent-error__retry"
                    >
                      <RotateCcw size={14} />
                      Retry
                    </button>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      scrollToBottom();
                      setShowScrollBtn(false);
                    }}
                    className="agent-scroll-btn"
                  >
                    <ChevronDown size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* ── Input Area ─────────────────────────────── */}
              <form onSubmit={handleSubmit} className="agent-input-area">
                {/* Suggestion chips when there are messages */}
                {hasMessages && !isStreaming && (
                  <div className="agent-input-chips">
                    {SUGGESTION_CHIPS.slice(0, 3).map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => handleChip(chip.key)}
                        className="agent-input-chip"
                      >
                        {chip.emoji} {t(`chips.${chip.key}`).replace(/^[^\s]+\s/, "")}
                      </button>
                    ))}
                  </div>
                )}

                <div className="agent-input-row">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t("placeholder")}
                    className="agent-textarea"
                    rows={1}
                    disabled={isStreaming}
                  />
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={() => {
                        haptic("tap");
                        stopStreaming();
                      }}
                      className="agent-send-btn agent-send-btn--stop"
                      aria-label="Stop generating"
                    >
                      <Square size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="agent-send-btn"
                      aria-label={t("send")}
                    >
                      <Send size={16} />
                    </button>
                  )}
                </div>

                <p className="agent-disclaimer">
                  GJC Assistant can make mistakes. Verify important info.
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
