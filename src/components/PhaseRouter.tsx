'use client';

import React from 'react';
import { usePhase } from '@/components/providers/PhaseProvider';
import { PreEventPhase } from './phases/PreEventPhase';
import { OnEventPhase } from './phases/OnEventPhase';
import { PostEventPhase } from './phases/PostEventPhase';
import { AnimatePresence } from 'framer-motion';

export function PhaseRouter({ props }: { props: any }) {
  const { currentPhase, isLoading } = usePhase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'pre' && <PreEventPhase key="pre" props={props} />}
      {currentPhase === 'on' && <OnEventPhase key="on" props={props} />}
      {currentPhase === 'post' && <PostEventPhase key="post" props={props} />}
    </AnimatePresence>
  );
}
