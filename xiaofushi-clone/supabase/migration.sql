-- ============================================================
-- Redo 论坛数据库结构
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本
-- ============================================================

-- 1. 用户资料表（与 auth.users 关联）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_letter text not null default 'U',
  avatar_color text not null default '#00C853',
  created_at timestamptz not null default now()
);

-- 2. 帖子表
create table if not exists public.topics (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null default '',
  category text not null default '问答交流',
  author_id uuid not null references public.profiles(id) on delete cascade,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. 回复表
create table if not exists public.replies (
  id bigint generated always as identity primary key,
  topic_id bigint not null references public.topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 索引
create index if not exists idx_topics_category on public.topics(category);
create index if not exists idx_topics_created on public.topics(created_at desc);
create index if not exists idx_replies_topic on public.replies(topic_id);

-- ============================================================
-- 行级安全策略 (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.replies enable row level security;

-- profiles: 任何人可读，本人可改
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- topics: 任何人可读，登录用户可发帖，作者可改/删
create policy "Topics are viewable by everyone"
  on public.topics for select using (true);

create policy "Authenticated users can create topics"
  on public.topics for insert with check (auth.role() = 'authenticated');

create policy "Authors can update own topics"
  on public.topics for update using (auth.uid() = author_id);

create policy "Authors can delete own topics"
  on public.topics for delete using (auth.uid() = author_id);

-- replies: 任何人可读，登录用户可回复，作者可改/删
create policy "Replies are viewable by everyone"
  on public.replies for select using (true);

create policy "Authenticated users can create replies"
  on public.replies for insert with check (auth.role() = 'authenticated');

create policy "Authors can update own replies"
  on public.replies for update using (auth.uid() = author_id);

create policy "Authors can delete own replies"
  on public.replies for delete using (auth.uid() = author_id);

-- ============================================================
-- 视图：帖子列表（带作者信息 + 回复数）
-- ============================================================

create or replace view public.topics_with_meta as
select
  t.id,
  t.title,
  t.body,
  t.category,
  t.author_id,
  t.views,
  t.created_at,
  t.updated_at,
  p.nickname as author_name,
  p.avatar_letter,
  p.avatar_color,
  coalesce(rc.cnt, 0) as reply_count,
  coalesce(lr.latest, t.created_at) as last_reply_at
from public.topics t
join public.profiles p on p.id = t.author_id
left join lateral (
  select count(*) as cnt from public.replies r where r.topic_id = t.id
) rc on true
left join lateral (
  select max(r2.created_at) as latest from public.replies r2 where r2.topic_id = t.id
) lr on true;

-- ============================================================
-- 函数：增加浏览量（避免 RLS 限制）
-- ============================================================

create or replace function public.increment_views(topic_id bigint)
returns void
language sql
security definer
as $$
  update public.topics set views = views + 1 where id = topic_id;
$$;

-- ============================================================
-- 自动创建用户资料的触发器
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nickname, avatar_letter, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'nickname', new.email), 1)),
    (array['#00BCD4','#FF9800','#4CAF50','#E91E63','#9C27B0','#2196F3','#FF7043'])[floor(random()*7+1)::int]
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
