-- Add 'selected' status to registration_status ENUM
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'selected';
