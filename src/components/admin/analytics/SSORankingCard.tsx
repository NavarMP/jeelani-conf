"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChartWrapper } from "./ChartWrapper";
import { FaGoogle, FaGithub, FaMicrosoft, FaApple } from "react-icons/fa";
import { Mail, ShieldCheck, KeyRound, Lock } from "lucide-react";

const ssoProviders = [
  {
    provider: "Google OAuth",
    users: 9840,
    percentage: 66.1,
    successRate: 99.8,
    icon: FaGoogle,
    color: "text-red-500",
    bg: "bg-red-500",
    barColor: "from-red-500 to-amber-500",
    category: "Primary Consumer SSO",
  },
  {
    provider: "GitHub Developer",
    users: 2650,
    percentage: 17.8,
    successRate: 99.9,
    icon: FaGithub,
    color: "text-neutral-800 dark:text-neutral-200",
    bg: "bg-neutral-800 dark:bg-neutral-200",
    barColor: "from-neutral-700 to-neutral-500",
    category: "Tech & AI Fiqh Delegates",
  },
  {
    provider: "Apple ID",
    users: 1420,
    percentage: 9.5,
    successRate: 99.7,
    icon: FaApple,
    color: "text-neutral-900 dark:text-white",
    bg: "bg-neutral-900 dark:bg-white",
    barColor: "from-neutral-800 to-neutral-400",
    category: "iOS & Safari App Clips",
  },
  {
    provider: "Microsoft Entra",
    users: 680,
    percentage: 4.6,
    successRate: 99.5,
    icon: FaMicrosoft,
    color: "text-blue-500",
    bg: "bg-blue-500",
    barColor: "from-blue-600 to-cyan-500",
    category: "Institution & University",
  },
  {
    provider: "Email Magic OTP",
    users: 300,
    percentage: 2.0,
    successRate: 98.9,
    icon: Mail,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    barColor: "from-emerald-600 to-teal-400",
    category: "Passwordless Direct",
  },
];

export function SSORankingCard() {
  return (
    <ChartWrapper
      title="Single Sign-On (SSO) & Auth Rankings"
      description="Identity Provider distribution, conversion rates, and session security"
    >
      <div className="space-y-4">
        {/* Security Summary Pills */}
        <div className="grid grid-cols-3 gap-2 pb-2 border-b border-[var(--admin-border-subtle)] text-center">
          <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)]">
            <span className="text-[10px] text-[var(--admin-text-muted)] uppercase font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              MFA Adoption
            </span>
            <span className="text-sm font-bold text-[var(--admin-text)]">71.4%</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)]">
            <span className="text-[10px] text-[var(--admin-text-muted)] uppercase font-bold flex items-center justify-center gap-1">
              <KeyRound className="w-3 h-3 text-[var(--color-turquoise)]" />
              Avg Session
            </span>
            <span className="text-sm font-bold text-[var(--admin-text)]">24m 18s</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)]">
            <span className="text-[10px] text-[var(--admin-text-muted)] uppercase font-bold flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-purple-500" />
              Auth Success
            </span>
            <span className="text-sm font-bold text-emerald-500">99.7%</span>
          </div>
        </div>

        {/* Ranked SSO list */}
        <div className="space-y-3">
          {ssoProviders.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.provider} className="p-2.5 rounded-xl bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] hover:border-[var(--admin-border)] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-[var(--admin-text-muted)] w-4">
                      #{index + 1}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border-subtle)] ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--admin-text)]">
                        {item.provider}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] text-[var(--admin-text-muted)] ml-2">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[var(--admin-text)]">
                      {item.users.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--admin-text-secondary)] ml-1.5">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="h-1.5 w-full bg-[var(--admin-border)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.barColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChartWrapper>
  );
}
