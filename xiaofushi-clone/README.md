# Redo — 日本永住申请时间预估

基于出入国在留管理庁公开数据的永住申请审批时间预估工具。

## 技术栈

- **前端**: React 19 + Vite + recharts
- **后端/数据库**: [Supabase](https://supabase.com)（PostgreSQL + Auth + RLS）
- **数据源**: e-Stat API v3.0 → 静态 JSON（GitHub Actions 每日自动更新）
- **部署**: GitHub Pages + GitHub Actions

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env

# 3. 配置 Supabase（见下方说明）

# 4. 启动开发服务器
npm run dev
```

## 配置 Supabase 后端

论坛功能（注册/登录/发帖/回复）需要 Supabase 后端。不配置时自动降级为 mock 数据展示。

### 步骤

1. 在 [supabase.com](https://supabase.com) 免费创建一个项目
2. 进入项目 **Settings → API**，复制：
   - `Project URL` → 填入 `.env` 的 `VITE_SUPABASE_URL`
   - `anon public` key → 填入 `.env` 的 `VITE_SUPABASE_ANON_KEY`
3. 进入 **SQL Editor**，粘贴并运行 `supabase/migration.sql` 的全部内容
4. 进入 **Authentication → Settings**，确认 Email Auth 已启用

### 数据库表结构

| 表 | 说明 |
|---|---|
| `profiles` | 用户资料（与 auth.users 自动关联） |
| `topics` | 论坛帖子 |
| `replies` | 帖子回复 |
| `topics_with_meta` | 视图：帖子 + 作者信息 + 回复数 |

所有表均启用了行级安全策略（RLS）：
- 任何人可读所有帖子和回复
- 仅登录用户可发帖/回复
- 仅作者可编辑/删除自己的内容

### GitHub Pages 部署

需要在仓库的 **Settings → Secrets** 中配置：
- `ESTAT_APP_ID` — e-Stat API 密钥（用于每日数据更新）

前端环境变量在构建时注入，需要在 GitHub Actions 的 workflow 文件中添加 Supabase 密钥，
或者将 `public/data/` 目录中的预生成 JSON 数据直接提交到仓库。

## 功能列表

- 首页：地区选择 → 统计卡片 + 累积数据柱状图 + 年度数据图 + 地区对比
- 个人预估：选择日期和地区，计算预估审批完成日期
- 社区论坛：注册/登录 → 发帖/回复（需配置 Supabase）
- 多语言：中文 / 日本語 / English
- 主题切换：浅色 / 深色 / 跟随系统
