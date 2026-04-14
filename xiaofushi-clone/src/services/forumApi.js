import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { forumTopics as mockTopics } from '../data/mockData';

const MOCK_REPLIES = [
  { id: 1, author_name: 'helper_01', avatar_letter: 'H', avatar_color: '#2196F3', created_at: '2025-01-13T10:00:00Z', content: '感谢分享！我也在同一个入管局申请，目前还在等待中。请问您的申请材料准备了多久？' },
  { id: 2, author_name: 'visa_pro', avatar_letter: 'V', avatar_color: '#4CAF50', created_at: '2025-01-13T14:00:00Z', content: '根据我的经验，名古屋最近审批速度有加快的趋势。建议大家关注最新数据。' },
  { id: 3, author_name: 'tokyo_user', avatar_letter: 'T', avatar_color: '#FF9800', created_at: '2025-01-13T22:00:00Z', content: '有没有人知道补充材料后会不会影响审批时间？我上周刚提交了追加材料。' },
];

function toMockTopicList() {
  return mockTopics.map((t) => ({
    id: t.id,
    title: t.title,
    body: '',
    category: t.category,
    author_name: t.author,
    avatar_letter: t.avatar,
    avatar_color: t.avatarColor,
    reply_count: t.replies,
    views: t.views,
    created_at: new Date().toISOString(),
    last_reply_at: new Date().toISOString(),
  }));
}

/**
 * 获取帖子列表
 */
export async function fetchTopics({ category, sortBy = 'last_reply_at' } = {}) {
  if (!isSupabaseConfigured()) {
    let list = toMockTopicList();
    if (category) list = list.filter((t) => t.category === category);
    return list;
  }

  let query = supabase
    .from('topics_with_meta')
    .select('*')
    .order(sortBy, { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchTopics error:', error);
    return toMockTopicList();
  }
  return data;
}

/**
 * 获取单个帖子详情
 */
export async function fetchTopic(topicId) {
  if (!isSupabaseConfigured()) {
    const mock = mockTopics.find((t) => t.id === Number(topicId));
    if (!mock) return null;
    return {
      id: mock.id, title: mock.title, body: `这是一篇关于「${mock.title}」的详细讨论帖。欢迎大家分享自己的经验和看法。\n\n申请永住是在日本长期居住的重要一步，希望大家互相帮助，分享有用的信息。`,
      category: mock.category, author_name: mock.author, avatar_letter: mock.avatar,
      avatar_color: mock.avatarColor, reply_count: mock.replies, views: mock.views,
      created_at: new Date().toISOString(), last_reply_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('topics_with_meta')
    .select('*')
    .eq('id', topicId)
    .single();

  if (error) return null;

  supabase.rpc('increment_views', { topic_id: topicId }).catch(() => {});

  return data;
}

/**
 * 获取帖子的回复列表
 */
export async function fetchReplies(topicId) {
  if (!isSupabaseConfigured()) {
    return MOCK_REPLIES;
  }

  const { data, error } = await supabase
    .from('replies')
    .select('id, content, created_at, profiles:author_id(nickname, avatar_letter, avatar_color)')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchReplies error:', error);
    return [];
  }

  return data.map((r) => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    author_name: r.profiles?.nickname || 'Unknown',
    avatar_letter: r.profiles?.avatar_letter || 'U',
    avatar_color: r.profiles?.avatar_color || '#999',
  }));
}

/**
 * 发布新帖子
 */
export async function createTopic({ title, body, category, authorId }) {
  if (!isSupabaseConfigured()) return { error: { message: 'Backend not configured' } };

  const { data, error } = await supabase
    .from('topics')
    .insert({ title, body, category, author_id: authorId })
    .select()
    .single();

  return { data, error };
}

/**
 * 发布回复
 */
export async function createReply({ topicId, content, authorId }) {
  if (!isSupabaseConfigured()) return { error: { message: 'Backend not configured' } };

  const { data, error } = await supabase
    .from('replies')
    .insert({ topic_id: topicId, content, author_id: authorId })
    .select()
    .single();

  return { data, error };
}

/**
 * 获取论坛统计
 */
export async function fetchForumStats() {
  if (!isSupabaseConfigured()) {
    return { members: 328, topics: 156, replies: 2340 };
  }

  const [{ count: members }, { count: topics }, { count: replies }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('replies').select('*', { count: 'exact', head: true }),
  ]);

  return { members: members || 0, topics: topics || 0, replies: replies || 0 };
}
