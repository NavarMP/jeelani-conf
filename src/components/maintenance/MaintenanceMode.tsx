"use client";

import { motion } from "framer-motion";
import { ParticleBackground } from "./ParticleBackground";
import { MouseSpotlight } from "./MouseSpotlight";
import { MagneticButton } from "./MagneticButton";
import { Mail, Shield, Activity } from "lucide-react";
import Link from "next/link";

export const MaintenanceMode = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030014] font-sans selection:bg-indigo-500/30">
      <ParticleBackground />
      <MouseSpotlight />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl sm:p-12"
        >
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.5)] relative"
            >
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-50 bg-indigo-500" />
              <Activity className="h-8 w-8 text-white relative z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-300 uppercase mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              System Upgrade in Progress
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
            >
              We're upgrading
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                your experience.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-10 max-w-lg text-lg text-zinc-400 leading-relaxed"
            >
              We are currently optimizing our platform to bring you a faster, smoother, and more advanced experience. We'll be back online shortly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <MagneticButton onClick={() => window.location.href = "mailto:info@alathurpadidars.in"}>
                <Mail className="h-4 w-4" />
                Contact Support
              </MagneticButton>
              <Link href="/admin">
                <MagneticButton className="bg-white text-zinc-950 hover:bg-zinc-200 hover:border-zinc-300">
                  <Shield className="h-4 w-4" />
                  Admin Access
                </MagneticButton>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 text-sm text-zinc-500 font-medium tracking-wide"
        >
          © {new Date().getFullYear()} Jeelani. All rights reserved.
        </motion.div>
      </main>
    </div>
  );
};
