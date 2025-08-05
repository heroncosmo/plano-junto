-- Create enum types
CREATE TYPE public.user_verification_status AS ENUM ('pending', 'verified');
CREATE TYPE public.group_status AS ENUM ('waiting_subscription', 'queue', 'active_with_slots');
CREATE TYPE public.service_category AS ENUM ('streaming', 'music', 'education', 'ai', 'gaming', 'productivity', 'other');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  cpf TEXT UNIQUE,
  phone TEXT,
  address_street TEXT,
  address_number TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  verification_status user_verification_status DEFAULT 'pending',
  verification_code TEXT,
  verification_expires_at TIMESTAMPTZ,
  pix_key TEXT, -- CPF-based pix key for withdrawals
  balance_cents INTEGER DEFAULT 0, -- User balance in cents
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table for pre-approved services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category service_category NOT NULL,
  icon_url TEXT,
  max_users INTEGER NOT NULL DEFAULT 6,
  pre_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  relationship_type TEXT NOT NULL, -- 'family', 'work', 'friends', etc
  max_members INTEGER NOT NULL,
  current_members INTEGER DEFAULT 1,
  price_per_slot_cents INTEGER NOT NULL,
  status group_status DEFAULT 'waiting_subscription',
  instant_access BOOLEAN DEFAULT false,
  admin_approved BOOLEAN DEFAULT false, -- For custom services
  owner_approved BOOLEAN DEFAULT false, -- Owner must approve after admin approval
  access_credentials TEXT, -- Encrypted access data
  access_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_amount_cents INTEGER NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create transactions table for payment tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit_purchase', 'group_payment', 'withdrawal', 'admin_fee'
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER DEFAULT 0,
  description TEXT,
  group_id UUID REFERENCES public.groups(id),
  payment_method TEXT, -- 'pix', 'credit_card', 'debit_card', 'credits'
  external_payment_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  two_fa_verified BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports table for user reports/complaints
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for services (public read)
CREATE POLICY "Services are publicly readable" ON public.services
  FOR SELECT USING (true);

-- Create RLS policies for groups
CREATE POLICY "Users can view all active groups" ON public.groups
  FOR SELECT USING (admin_approved = true OR admin_id = auth.uid());

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their groups" ON public.groups
  FOR UPDATE USING (admin_id = auth.uid());

-- Create RLS policies for group memberships
CREATE POLICY "Users can view memberships of groups they're in" ON public.group_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.groups WHERE id = group_id AND admin_id = auth.uid())
  );

CREATE POLICY "Users can join groups" ON public.group_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawal requests" ON public.withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for reports
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert initial services
INSERT INTO public.services (name, category, max_users, pre_approved) VALUES
  ('YouTube Premium', 'streaming', 6, true),
  ('Netflix', 'streaming', 4, true),
  ('Spotify Premium', 'music', 6, true),
  ('Amazon Prime Video', 'streaming', 3, true),
  ('Disney+', 'streaming', 4, true),
  ('HBO Max', 'streaming', 3, true),
  ('Paramount+', 'streaming', 6, true),
  ('Apple TV+', 'streaming', 6, true),
  ('Udemy', 'education', 1, true),
  ('ChatGPT Plus', 'ai', 1, true),
  ('Canva Pro', 'productivity', 5, true),
  ('Adobe Creative Cloud', 'productivity', 1, true);