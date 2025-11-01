-- Create enum for chat message types
CREATE TYPE public.message_type AS ENUM ('text', 'system');

-- Create chat rooms table for topic-based discussions
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type public.message_type DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  CHECK (room_id IS NOT NULL OR recipient_id IS NOT NULL)
);

-- Create user blocks table for privacy
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Create mentor profiles table
CREATE TABLE public.mentor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT,
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor sessions table
CREATE TABLE public.mentor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table with additional fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS accessibility_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Anyone can view active chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON public.chat_rooms FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in rooms they participate in"
  ON public.chat_messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Messages in rooms are visible to all authenticated users
      room_id IS NOT NULL OR
      -- DMs are visible to sender and recipient
      (recipient_id = auth.uid() OR sender_id = auth.uid())
    ) AND
    -- Check if user is not blocked
    NOT EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = sender_id AND blocked_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    -- Cannot send to blocked users
    NOT EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = recipient_id AND blocked_id = auth.uid())
         OR (blocker_id = auth.uid() AND blocked_id = recipient_id)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- RLS Policies for user_blocks
CREATE POLICY "Users can view their own blocks"
  ON public.user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON public.user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON public.user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- RLS Policies for mentor_profiles
CREATE POLICY "Anyone can view mentor profiles"
  ON public.mentor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own mentor profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can update their own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.mentor_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentor_profiles WHERE id = mentor_id
      UNION
      SELECT student_id
    )
  );

CREATE POLICY "Students can create sessions"
  ON public.mentor_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Mentors and students can update their sessions"
  ON public.mentor_sessions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentor_profiles WHERE id = mentor_id
      UNION
      SELECT student_id
    )
  );

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Create indexes for better performance
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON public.chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_mentor_profiles_skills ON public.mentor_profiles USING GIN(skills);
CREATE INDEX idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_student_id ON public.mentor_sessions(student_id);

-- Create triggers for updating updated_at
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_sessions_updated_at
  BEFORE UPDATE ON public.mentor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();