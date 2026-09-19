-- Migration: Create feedback table
-- Description: Adds a feedback table for conference attendees to submit ratings and comments

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    category_ratings JSONB DEFAULT '{}'::jsonb,
    feedback_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    sentiment VARCHAR(20) DEFAULT 'neutral',
    is_featured BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    admin_notes TEXT,
    source VARCHAR(20) DEFAULT 'web',
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_feedback_modtime
    BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on feedback"
    ON public.feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage feedback"
    ON public.feedback FOR ALL USING (true) WITH CHECK (true);
