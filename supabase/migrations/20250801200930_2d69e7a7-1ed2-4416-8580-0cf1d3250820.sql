-- Create users table for numeric ID authentication
CREATE TABLE public.users (
  id BIGINT PRIMARY KEY,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE public.sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE public.chats (
  chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (id = (current_setting('app.current_user_id'))::bigint);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (id = (current_setting('app.current_user_id'))::bigint);

-- Create RLS policies for sessions table
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (user_id = (current_setting('app.current_user_id'))::bigint);

CREATE POLICY "Users can create their own sessions" ON public.sessions
  FOR INSERT WITH CHECK (user_id = (current_setting('app.current_user_id'))::bigint);

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (user_id = (current_setting('app.current_user_id'))::bigint);

CREATE POLICY "Users can delete their own sessions" ON public.sessions
  FOR DELETE USING (user_id = (current_setting('app.current_user_id'))::bigint);

-- Create RLS policies for chats table
CREATE POLICY "Users can view their own chats" ON public.chats
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM public.sessions 
      WHERE user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can create chats in their sessions" ON public.chats
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.sessions 
      WHERE user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can update their own chats" ON public.chats
  FOR UPDATE USING (
    session_id IN (
      SELECT session_id FROM public.sessions 
      WHERE user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can delete their own chats" ON public.chats
  FOR DELETE USING (
    session_id IN (
      SELECT session_id FROM public.sessions 
      WHERE user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages in their chats" ON public.messages
  FOR SELECT USING (
    chat_id IN (
      SELECT c.chat_id FROM public.chats c
      JOIN public.sessions s ON c.session_id = s.session_id
      WHERE s.user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can create messages in their chats" ON public.messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT c.chat_id FROM public.chats c
      JOIN public.sessions s ON c.session_id = s.session_id
      WHERE s.user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can update messages in their chats" ON public.messages
  FOR UPDATE USING (
    chat_id IN (
      SELECT c.chat_id FROM public.chats c
      JOIN public.sessions s ON c.session_id = s.session_id
      WHERE s.user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

CREATE POLICY "Users can delete messages in their chats" ON public.messages
  FOR DELETE USING (
    chat_id IN (
      SELECT c.chat_id FROM public.chats c
      JOIN public.sessions s ON c.session_id = s.session_id
      WHERE s.user_id = (current_setting('app.current_user_id'))::bigint
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_chats_session_id ON public.chats(session_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);