import { createContext, useContext, useState, useCallback } from 'react';

const I18nContext = createContext();

const translations = {
  zh: {
    nav: { home: '首页', bbs: '社区', settings: '设置' },
    hero: {
      title: '日本永住申请时间预估',
      desc: '基于出入国在留管理庁公开数据，为您预估永住申请审批时间',
      cta: '添加我的日期，获取精确预估',
    },
    region: { title: '选择地区' },
    stats: {
      days: '预估审批天数', dayUnit: '天',
      rate: '许可率', rateUnit: '%',
      pending: '待处理申请数', pendingUnit: '件',
    },
    chart: {
      cumulative: '累積データ', from: '年から', prevTotal: '前月総数',
      pendingLabel: '待处理积压数',
      yearly: '每年新增申请数据',
      newApps: '新增申请', approved: '许可', rejected: '不许可',
      regionCompare: '各地区预估审批天数', estDays: '预估天数',
    },
    faq: { title: '常见问题' },
    source: {
      title: '数据来源',
      desc: '本站数据来源于出入国在留管理庁公开的「出入国管理統計」，可与官方数据进行比对。',
    },
    bbs: {
      title: '社区', login: '登录', register: '注册',
      loginHint: '登录后参与讨论',
      communityStats: '社区统计', members: '成员', topics: '主题', replies: '回复', boards: '版块',
      categories: '版块分类', more: '更多话题 →',
      tabs: ['最新回复', '最新发帖', '经验分享', '问答交流'],
    },
    settings: {
      title: '设置',
      language: '语言 / Language', languageDesc: '选择界面显示语言',
      theme: '主题 / Theme', themeDesc: '选择界面主题风格',
      light: '浅色', dark: '深色', auto: '跟随系统',
      about: '关于', aboutText: '日本永住申请时间预估',
      dataSource: '数据来源：日本政府统计局（e-Stat）', version: '版本：1.0.0',
    },
    sidebar: { hotTopics: '热门讨论' },
    datePicker: {
      title: '个人预估计算',
      regionLabel: '申请地区',
      dateLabel: '提交申请日期',
      calculate: '计算预估',
      resultPrefix: '预估审批完成日期：',
      resultDays: '预计等待约 {days} 天',
      close: '关闭',
    },
    auth: {
      loginTitle: '登录',
      registerTitle: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      submit: '提交',
      cancel: '取消',
      switchToRegister: '没有账号？去注册',
      switchToLogin: '已有账号？去登录',
    },
    topicDetail: {
      back: '← 返回社区',
      replyCount: '条回复',
      views: '次浏览',
      replyPlaceholder: '写下你的回复...',
      replyBtn: '回复',
      loginToReply: '登录后即可回复',
    },
  },
  ja: {
    nav: { home: 'ホーム', bbs: 'コミュニティ', settings: '設定' },
    hero: {
      title: '日本永住申請審査期間予測',
      desc: '出入国在留管理庁の公開データに基づき、永住申請の審査期間を予測します',
      cta: '申請日を追加して正確な予測を取得',
    },
    region: { title: '地域を選択' },
    stats: {
      days: '予想審査日数', dayUnit: '日',
      rate: '許可率', rateUnit: '%',
      pending: '処理待ち申請数', pendingUnit: '件',
    },
    chart: {
      cumulative: '累積データ', from: '年から', prevTotal: '前月総数',
      pendingLabel: '処理待ち件数',
      yearly: '年間新規申請データ',
      newApps: '新規申請', approved: '許可', rejected: '不許可',
      regionCompare: '各地域の予想審査日数', estDays: '予想日数',
    },
    faq: { title: 'よくある質問' },
    source: {
      title: 'データソース',
      desc: '本サイトのデータは出入国在留管理庁が公開する「出入国管理統計」に基づいています。',
    },
    bbs: {
      title: 'コミュニティ', login: 'ログイン', register: '新規登録',
      loginHint: 'ログインして議論に参加',
      communityStats: 'コミュニティ統計', members: 'メンバー', topics: 'トピック', replies: '返信', boards: '掲示板',
      categories: 'カテゴリ', more: 'もっと見る →',
      tabs: ['最新返信', '最新投稿', '体験談', 'Q&A'],
    },
    settings: {
      title: '設定',
      language: '言語 / Language', languageDesc: 'インターフェース言語を選択',
      theme: 'テーマ / Theme', themeDesc: 'インターフェーステーマを選択',
      light: 'ライト', dark: 'ダーク', auto: 'システムに従う',
      about: 'について', aboutText: '日本永住申請審査期間予測',
      dataSource: 'データソース：日本政府統計局（e-Stat）', version: 'バージョン：1.0.0',
    },
    sidebar: { hotTopics: '人気のトピック' },
    datePicker: {
      title: '個人予測計算',
      regionLabel: '申請地域',
      dateLabel: '申請提出日',
      calculate: '予測を計算',
      resultPrefix: '予想審査完了日：',
      resultDays: '約 {days} 日待ちの見込み',
      close: '閉じる',
    },
    auth: {
      loginTitle: 'ログイン',
      registerTitle: '新規登録',
      email: 'メール',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      submit: '送信',
      cancel: 'キャンセル',
      switchToRegister: 'アカウントをお持ちでない方',
      switchToLogin: 'すでにアカウントをお持ちの方',
    },
    topicDetail: {
      back: '← コミュニティに戻る',
      replyCount: '件の返信',
      views: '回閲覧',
      replyPlaceholder: '返信を入力...',
      replyBtn: '返信',
      loginToReply: 'ログインして返信',
    },
  },
  en: {
    nav: { home: 'Home', bbs: 'Community', settings: 'Settings' },
    hero: {
      title: 'Japan PR Application Time Estimator',
      desc: 'Estimate your permanent residence application processing time based on official data',
      cta: 'Add my date for a precise estimate',
    },
    region: { title: 'Select Region' },
    stats: {
      days: 'Est. Processing Days', dayUnit: 'days',
      rate: 'Approval Rate', rateUnit: '%',
      pending: 'Pending Applications', pendingUnit: '',
    },
    chart: {
      cumulative: ' Cumulative Data', from: ' onwards', prevTotal: 'Latest Total',
      pendingLabel: 'Pending Backlog',
      yearly: 'Annual New Applications',
      newApps: 'New Apps', approved: 'Approved', rejected: 'Rejected',
      regionCompare: 'Estimated Days by Region', estDays: 'Est. Days',
    },
    faq: { title: 'FAQ' },
    source: {
      title: 'Data Source',
      desc: 'Data sourced from the Immigration Services Agency of Japan official statistics.',
    },
    bbs: {
      title: 'Community', login: 'Login', register: 'Register',
      loginHint: 'Login to join the discussion',
      communityStats: 'Community Stats', members: 'Members', topics: 'Topics', replies: 'Replies', boards: 'Boards',
      categories: 'Categories', more: 'More topics →',
      tabs: ['Latest Replies', 'Latest Posts', 'Experiences', 'Q&A'],
    },
    settings: {
      title: 'Settings',
      language: 'Language', languageDesc: 'Choose display language',
      theme: 'Theme', themeDesc: 'Choose interface theme',
      light: 'Light', dark: 'Dark', auto: 'System',
      about: 'About', aboutText: 'Japan PR Application Time Estimator',
      dataSource: 'Data: Japan Government Statistics Bureau (e-Stat)', version: 'Version: 1.0.0',
    },
    sidebar: { hotTopics: 'Hot Topics' },
    datePicker: {
      title: 'Personal Estimate',
      regionLabel: 'Application Region',
      dateLabel: 'Submission Date',
      calculate: 'Calculate',
      resultPrefix: 'Estimated completion date: ',
      resultDays: 'Estimated wait: ~{days} days',
      close: 'Close',
    },
    auth: {
      loginTitle: 'Login',
      registerTitle: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Submit',
      cancel: 'Cancel',
      switchToRegister: "Don't have an account? Register",
      switchToLogin: 'Already have an account? Login',
    },
    topicDetail: {
      back: '← Back to Community',
      replyCount: ' replies',
      views: ' views',
      replyPlaceholder: 'Write your reply...',
      replyBtn: 'Reply',
      loginToReply: 'Login to reply',
    },
  },
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('redo-lang') || 'zh');

  const changeLang = useCallback((l) => {
    setLang(l);
    localStorage.setItem('redo-lang', l);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
