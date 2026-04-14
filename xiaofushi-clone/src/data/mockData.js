export const regions = [
  { id: 'tokyo', name: '东京', nameJa: '東京' },
  { id: 'osaka', name: '大阪', nameJa: '大阪' },
  { id: 'nagoya', name: '名古屋', nameJa: '名古屋' },
  { id: 'fukuoka', name: '福冈', nameJa: '福岡' },
  { id: 'sapporo', name: '札幌', nameJa: '札幌' },
  { id: 'hiroshima', name: '广岛', nameJa: '広島' },
  { id: 'sendai', name: '仙台', nameJa: '仙台' },
  { id: 'takamatsu', name: '高松', nameJa: '高松' },
];

export const regionStats = {
  tokyo: { avgDays: 400, approvalRate: 40.7, pending: 12500 },
  osaka: { avgDays: 320, approvalRate: 45.2, pending: 6800 },
  nagoya: { avgDays: 280, approvalRate: 48.1, pending: 4200 },
  fukuoka: { avgDays: 250, approvalRate: 52.3, pending: 2800 },
  sapporo: { avgDays: 220, approvalRate: 55.0, pending: 1500 },
  hiroshima: { avgDays: 260, approvalRate: 50.5, pending: 1800 },
  sendai: { avgDays: 230, approvalRate: 53.2, pending: 1200 },
  takamatsu: { avgDays: 180, approvalRate: 67.7, pending: 89 },
};

export const accumulatedData = [
  { month: '2024-01', total: 52000, processed: 38000 },
  { month: '2024-02', total: 53200, processed: 38800 },
  { month: '2024-03', total: 54500, processed: 39700 },
  { month: '2024-04', total: 56000, processed: 40500 },
  { month: '2024-05', total: 57800, processed: 41200 },
  { month: '2024-06', total: 59200, processed: 42100 },
  { month: '2024-07', total: 60800, processed: 43000 },
  { month: '2024-08', total: 62500, processed: 44200 },
  { month: '2024-09', total: 64000, processed: 45000 },
  { month: '2024-10', total: 65200, processed: 46100 },
  { month: '2024-11', total: 66800, processed: 47000 },
  { month: '2024-12', total: 68500, processed: 48200 },
];

export const monthlyNewData = [
  { month: '2024-01', newApps: 1200, approved: 850, rejected: 180 },
  { month: '2024-02', newApps: 1350, approved: 920, rejected: 200 },
  { month: '2024-03', newApps: 1500, approved: 980, rejected: 190 },
  { month: '2024-04', newApps: 1280, approved: 870, rejected: 175 },
  { month: '2024-05', newApps: 1420, approved: 950, rejected: 210 },
  { month: '2024-06', newApps: 1550, approved: 1020, rejected: 195 },
  { month: '2024-07', newApps: 1380, approved: 900, rejected: 185 },
  { month: '2024-08', newApps: 1600, approved: 1050, rejected: 220 },
  { month: '2024-09', newApps: 1450, approved: 970, rejected: 205 },
  { month: '2024-10', newApps: 1520, approved: 1010, rejected: 198 },
  { month: '2024-11', newApps: 1680, approved: 1100, rejected: 215 },
  { month: '2024-12', newApps: 1750, approved: 1150, rejected: 230 },
];

export const processingByRegion = [
  { region: '东京', days: 400 },
  { region: '高松', days: 180 },
  { region: '大阪', days: 320 },
  { region: '名古屋', days: 280 },
  { region: '广岛', days: 260 },
  { region: '福冈', days: 250 },
  { region: '仙台', days: 230 },
  { region: '札幌', days: 220 },
];

export const faqItems = [
  {
    question: '数据来源是什么？',
    answer: '本站数据来源于日本政府统计局（e-Stat）公开的出入国管理统计数据。我们定期从官方API获取最新数据并进行可视化展示。',
  },
  {
    question: '预估算法准确吗？',
    answer: '预估时间基于历史审批数据的统计分析，仅供参考。实际审批时间受多种因素影响，包括申请材料的完整性、申请人的具体情况、以及入管局的工作量等。',
  },
  {
    question: '会开发手机App吗？',
    answer: '目前暂无开发手机App的计划。本网站已针对移动端进行了适配，您可以直接通过手机浏览器访问。',
  },
  {
    question: '东京的数据包含哪些范围？',
    answer: '东京的数据包含东京出入国在留管理局管辖范围内的所有永住申请，包括东京都、埼玉县、千叶县、茨城县、栃木县、群马县、山梨县、长野县、新潟县。',
  },
  {
    question: '数据多久更新一次？',
    answer: '我们每月从e-Stat获取最新数据。由于官方数据发布存在约2-3个月的延迟，因此本站显示的最新数据通常为2-3个月前的统计。',
  },
];

export const forumTopics = [
  {
    id: 1,
    title: '2024年东京永住申请经验分享',
    author: 'sakura_cn',
    avatar: 'S',
    avatarColor: '#00BCD4',
    replies: 23,
    views: 1520,
    lastReply: '2小时前',
    category: '经验分享',
  },
  {
    id: 2,
    title: '名古屋入管局最近审批速度如何？',
    author: 'nagoya_life',
    avatar: 'N',
    avatarColor: '#FF9800',
    replies: 15,
    views: 890,
    lastReply: '5小时前',
    category: '问答交流',
  },
  {
    id: 3,
    title: '永住申请材料清单整理（2024年最新版）',
    author: 'visa_helper',
    avatar: 'V',
    avatarColor: '#4CAF50',
    replies: 45,
    views: 3200,
    lastReply: '1天前',
    category: '资料整理',
  },
  {
    id: 4,
    title: '大阪永住申请被拒经历及再申请',
    author: 'osaka_dream',
    avatar: 'O',
    avatarColor: '#E91E63',
    replies: 31,
    views: 2100,
    lastReply: '2天前',
    category: '经验分享',
  },
  {
    id: 5,
    title: '关于纳税证明的几个注意事项',
    author: 'tax_master',
    avatar: 'T',
    avatarColor: '#9C27B0',
    replies: 18,
    views: 1350,
    lastReply: '3天前',
    category: '问答交流',
  },
  {
    id: 6,
    title: '福冈入管永住申请进度追踪',
    author: 'fukuoka_fan',
    avatar: 'F',
    avatarColor: '#2196F3',
    replies: 8,
    views: 560,
    lastReply: '4天前',
    category: '进度追踪',
  },
];

export const forumStats = {
  members: 328,
  topics: 156,
  replies: 2340,
  boards: 7,
};

export const forumCategories = [
  { name: '经验分享', count: 65, color: '#4CAF50' },
  { name: '问答交流', count: 42, color: '#2196F3' },
  { name: '资料整理', count: 18, color: '#FF9800' },
  { name: '进度追踪', count: 22, color: '#E91E63' },
  { name: '政策动态', count: 9, color: '#9C27B0' },
];
