-- Add 'maintenance' to the conference_phase enum
ALTER TYPE conference_phase ADD VALUE IF NOT EXISTS 'maintenance';
