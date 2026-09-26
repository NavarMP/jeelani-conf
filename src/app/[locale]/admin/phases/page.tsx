import React from 'react';
import { PhaseManager } from '@/components/admin/PhaseManager';

export const metadata = {
  title: 'Phase Management | Admin',
};

export default function PhaseManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phase Management</h1>
        <p className="text-muted-foreground">
          Control the active state of the conference application.
        </p>
      </div>
      
      <PhaseManager />
    </div>
  );
}
