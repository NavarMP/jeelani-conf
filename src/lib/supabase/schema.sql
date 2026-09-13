-- Supabase Schema for Grand Jeelani Conference

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for registration statuses
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- 1. Grand Assembly Registrations (Private/Invite)
CREATE TABLE public.registrations_grand_assembly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., REG-2026-X79M
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dars_name VARCHAR(255) NOT NULL,
    place VARCHAR(255) NOT NULL,
    zone VARCHAR(10),
    row_num VARCHAR(10),
    seat_num VARCHAR(10),
    status registration_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Musthafa Darimi Session Registrations (Paid)
CREATE TABLE public.registrations_darimi_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_status payment_status DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    status registration_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Paper Presentation Registrations (Free)
CREATE TABLE public.registrations_paper_presentation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255) NOT NULL,
    paper_title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    file_url VARCHAR(1000),
    review_status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, accepted, rejected
    status registration_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers
CREATE TRIGGER update_reg_assembly_modtime
    BEFORE UPDATE ON registrations_grand_assembly
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_reg_darimi_modtime
    BEFORE UPDATE ON registrations_darimi_session
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_reg_paper_modtime
    BEFORE UPDATE ON registrations_paper_presentation
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Row Level Security (RLS)
ALTER TABLE public.registrations_grand_assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_darimi_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_paper_presentation ENABLE ROW LEVEL SECURITY;

-- Policies (allow insert for public, select/update for admin only)
CREATE POLICY "Allow public insert on assembly" 
    ON public.registrations_grand_assembly FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public insert on darimi" 
    ON public.registrations_darimi_session FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public insert on paper" 
    ON public.registrations_paper_presentation FOR INSERT 
    WITH CHECK (true);
