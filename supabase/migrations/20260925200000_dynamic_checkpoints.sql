-- ==============================================================================
-- DYNAMIC CHECKPOINTS: Relaxing unique constraints
-- ==============================================================================

-- Drop the strict unique constraints that prevent multi-point scanning
DROP INDEX IF EXISTS public.idx_attendance_unique_session;
DROP INDEX IF EXISTS public.idx_attendance_unique_venue;

-- Add a compound index to speed up duplicate checks for specific checkpoints
CREATE INDEX IF NOT EXISTS idx_attendance_reg_gate 
    ON public.attendance_logs (registration_id, gate);
