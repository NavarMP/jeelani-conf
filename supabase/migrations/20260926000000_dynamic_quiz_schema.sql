-- Dynamic Quiz Schema

-- 1. Quiz Locations (Physical spots at the conference for QR codes)
CREATE TABLE IF NOT EXISTS public.quiz_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- The 'loc' parameter in the URL
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES public.quiz_locations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  media_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quiz Answers (Options for questions)
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Quiz Participants
CREATE TABLE IF NOT EXISTS public.quiz_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quiz Entries/Responses
CREATE TABLE IF NOT EXISTS public.quiz_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES public.quiz_participants(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer_id UUID REFERENCES public.quiz_answers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.quiz_locations(id) ON DELETE CASCADE,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_quiz_locations_modtime ON quiz_locations;
CREATE TRIGGER update_quiz_locations_modtime BEFORE UPDATE ON quiz_locations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_quiz_questions_modtime ON quiz_questions;
CREATE TRIGGER update_quiz_questions_modtime BEFORE UPDATE ON quiz_questions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_quiz_answers_modtime ON quiz_answers;
CREATE TRIGGER update_quiz_answers_modtime BEFORE UPDATE ON quiz_answers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Row Level Security (RLS)
ALTER TABLE public.quiz_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_entries ENABLE ROW LEVEL SECURITY;

-- Policies

-- Public Read Access for active locations, questions, and answers
DROP POLICY IF EXISTS "Allow public select on active quiz_locations" ON public.quiz_locations;
CREATE POLICY "Allow public select on active quiz_locations" ON public.quiz_locations FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public select on active quiz_questions" ON public.quiz_questions;
CREATE POLICY "Allow public select on active quiz_questions" ON public.quiz_questions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public select on quiz_answers" ON public.quiz_answers;
CREATE POLICY "Allow public select on quiz_answers" ON public.quiz_answers FOR SELECT USING (true);

-- Public Insert Access for participants and entries
DROP POLICY IF EXISTS "Allow public insert on quiz_participants" ON public.quiz_participants;
CREATE POLICY "Allow public insert on quiz_participants" ON public.quiz_participants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on quiz_entries" ON public.quiz_entries;
CREATE POLICY "Allow public insert on quiz_entries" ON public.quiz_entries FOR INSERT WITH CHECK (true);

-- Admin full access to all quiz tables
DROP POLICY IF EXISTS "Admin manage quiz_locations" ON public.quiz_locations;
CREATE POLICY "Admin manage quiz_locations" ON public.quiz_locations FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage quiz_questions" ON public.quiz_questions;
CREATE POLICY "Admin manage quiz_questions" ON public.quiz_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage quiz_answers" ON public.quiz_answers;
CREATE POLICY "Admin manage quiz_answers" ON public.quiz_answers FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage quiz_participants" ON public.quiz_participants;
CREATE POLICY "Admin manage quiz_participants" ON public.quiz_participants FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage quiz_entries" ON public.quiz_entries;
CREATE POLICY "Admin manage quiz_entries" ON public.quiz_entries FOR ALL USING (true);
