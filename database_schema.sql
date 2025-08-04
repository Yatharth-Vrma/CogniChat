-- CogniChat Database Schema
-- This file contains the complete database schema for CogniChat including user management, chats, messages, files, and vector search

-- Enable the pgvector extension for vector similarity search
create extension if not exists vector;

-- User profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Files table to store uploaded file metadata
create table if not exists public.files (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  filename text not null,
  file_size bigint,
  mime_type text,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Chats table to store chat sessions
create table if not exists public.chats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  file_id uuid references public.files,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages table to store individual chat messages
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats not null,
  user_id uuid references auth.users not null,
  content text not null,
  role text not null check (role in ('user', 'assistant')),
  file_id uuid references public.files,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Vector chunks table for RAG (Retrieval Augmented Generation)
create table if not exists public.vector_chunks (
  id uuid default uuid_generate_v4() primary key,
  file_id uuid references public.files,
  chunk_index integer not null,
  content text not null,
  embedding vector(768) not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Original documents table (for backward compatibility)
create table if not exists public.documents (
  id bigserial primary key,
  content text not null,
  embedding vector(768),
  created_at timestamp with time zone default now()
);

-- Function to search for similar vector chunks
create or replace function match_vector_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
language sql stable
as $$
  select
    vector_chunks.id,
    vector_chunks.content,
    1 - (vector_chunks.embedding <=> query_embedding) as similarity,
    vector_chunks.metadata
  from vector_chunks
  where 1 - (vector_chunks.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Function to search for similar documents (backward compatibility)
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Create indexes for better performance
create index if not exists idx_vector_chunks_embedding on vector_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_documents_embedding on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_messages_chat_id on messages(chat_id);
create index if not exists idx_messages_created_at on messages(created_at);
create index if not exists idx_chats_user_id on chats(user_id);
create index if not exists idx_chats_updated_at on chats(updated_at);
create index if not exists idx_files_user_id on files(user_id);

-- Row Level Security (RLS) policies
alter table public.profiles enable row level security;
alter table public.files enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.vector_chunks enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Files policies
create policy "Users can view own files" on files for select using (auth.uid() = user_id);
create policy "Users can insert own files" on files for insert with check (auth.uid() = user_id);
create policy "Users can update own files" on files for update using (auth.uid() = user_id);
create policy "Users can delete own files" on files for delete using (auth.uid() = user_id);

-- Chats policies
create policy "Users can view own chats" on chats for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on chats for insert with check (auth.uid() = user_id);
create policy "Users can update own chats" on chats for update using (auth.uid() = user_id);
create policy "Users can delete own chats" on chats for delete using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view own messages" on messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on messages for insert with check (auth.uid() = user_id);
create policy "Users can update own messages" on messages for update using (auth.uid() = user_id);
create policy "Users can delete own messages" on messages for delete using (auth.uid() = user_id);

-- Vector chunks policies (allow access to all users for RAG functionality)
create policy "Users can view vector chunks" on vector_chunks for select using (true);
create policy "Users can insert vector chunks" on vector_chunks for insert with check (true);
create policy "Users can update vector chunks" on vector_chunks for update using (true);
create policy "Users can delete vector chunks" on vector_chunks for delete using (true);

-- Documents policies (backward compatibility)
create policy "Users can view documents" on documents for select using (true);
create policy "Users can insert documents" on documents for insert with check (true);
create policy "Users can update documents" on documents for update using (true);
create policy "Users can delete documents" on documents for delete using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
