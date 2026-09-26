import React from 'react';
import QuizApp from '@/components/quiz/QuizApp';

export const metadata = {
  title: 'Interactive Conference Quiz',
  description: 'Participate in the dynamic conference quiz!',
};

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-[var(--color-turquoise)] selection:text-black">
      <QuizApp />
    </main>
  );
}
