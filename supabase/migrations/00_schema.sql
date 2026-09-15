-- Digital Heroes Supabase Schema

-- Users Table
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  role text DEFAULT 'subscriber' CHECK (role IN ('public', 'subscriber', 'admin')),
  charity_id uuid, -- References charities table
  charity_percentage integer DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Charities Table
CREATE TABLE public.charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Golf Scores Table (Rolling 5 logic handled in Edge Function or application logic)
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  stableford_score integer NOT NULL CHECK (stableford_score >= 1 AND stableford_score <= 45),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date) -- Only one score per day
);

-- Draws Table
CREATE TABLE public.draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL, -- e.g., '2026-09-01'
  total_pool numeric NOT NULL DEFAULT 0,
  type text DEFAULT 'random' CHECK (type IN ('random', 'algorithmic')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  jackpot_rollover numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Winners Table
CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  match_tier integer NOT NULL CHECK (match_tier IN (3, 4, 5)),
  prize_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  proof_url text, -- S3 / Storage URL for screenshot verification
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admins can read/write all users
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Charities are readable by everyone
CREATE POLICY "Charities are viewable by everyone" ON public.charities FOR SELECT USING (true);

-- Scores: Users can read/write their own scores
CREATE POLICY "Users can read own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Draws/Winners: public can view published winners, admins can do everything
CREATE POLICY "Public can view published draws" ON public.draws FOR SELECT USING (status = 'published');
CREATE POLICY "Winners are viewable by involved users" ON public.winners FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
