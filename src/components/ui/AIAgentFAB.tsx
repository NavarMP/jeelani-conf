"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface AIAgentFABProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}

export function AIAgentFAB({ isOpen, onClick, hasUnread }: AIAgentFABProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`agent-fab ${isOpen ? "agent-fab--open" : ""}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 1,
      }}
      aria-label="Toggle AI Assistant"
      title="GJC Assistant (⌘J)"
    >
      {/* Pulsing glow ring */}
      {!isOpen && (
        <span className="agent-fab__glow" />
      )}

      {/* Icon */}
      <motion.span
        key={isOpen ? "close" : "open"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="agent-fab__icon"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </motion.span>

      {/* Unread badge */}
      {hasUnread && !isOpen && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="agent-fab__badge"
        />
      )}
    </motion.button>
  );
}
