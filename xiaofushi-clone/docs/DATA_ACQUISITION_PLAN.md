# 数据获取方案：出入国在留管理庁「出入国管理統計」

## 1. 数据来源概述

数据来自日本政府统计门户 **e-Stat**（政府統計の総合窓口），由**法务省 出入国在留管理庁**发布。

- 官网：https://www.e-stat.go.jp
- 统计分类代码：`00250011`（出入国管理統計）
- API 文档：https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0

---

## 2. 需要获取的统计表

### 2.1 核心表：地方局管内别 在留资格取得等受理及处理人员（月次）

| 属性 | 值 |
|---|---|
| **statsDataId** | `0003288730` |
| **表名** | 地方出入国在留管理局管内別 在留資格の取得等の受理及び処理人員 |
| **频率** | 年次（含月度明细） |
| **包含数据** | 受理总数、旧受、新受、既济（许可/不许可/其他）、未济 |
| **在留资格分类** | 资格取得、期间更新、资格变更、资格外活动、再入国、**永住** |
| **地区维度** | 8 大管区：札幌、仙台、东京、名古屋、大阪、广岛、高松、福冈 |
| **时间跨度** | 2006年 ～ 2024年 |

### 2.2 补充表：国籍·地域别 永住许可人员（年次）

| 属性 | 值 |
|---|---|
| **statsDataId** | `0003289203` |
| **表名** | 国籍・地域別 地方出入国在留管理局管内別 永住許可人員 |
| **频率** | 年次 |
| **包含数据** | 各国籍的永住许可人数，按管区分 |

---

## 3. e-Stat API 使用方法

### 3.1 注册获取 appId

1. 访问 https://www.e-stat.go.jp 注册账号
2. 登录后进入「マイページ」→「API機能（アプリケーションID発行）」
3. 填写应用名称和 URL（可用 `http://localhost`），点击发行
4. 获得 `appId`（格式如 `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 3.2 API 端点

```
基础 URL: https://api.e-stat.go.jp/rest/3.0/app/json/
```

### 3.3 关键 API 方法

#### (1) 搜索统计表 - getStatsList

```
GET https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList
  ?appId={YOUR_APP_ID}
  &searchWord=永住
  &statsCode=00250011
```

#### (2) 获取元数据 - getMetaInfo

```
GET https://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo
  ?appId={YOUR_APP_ID}
  &statsDataId=0003288730
```

#### (3) 获取统计数据 - getStatsData（核心）

```
GET https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData
  ?appId={YOUR_APP_ID}
  &statsDataId=0003288730
  &cdCat02=150            ← 永住（在留资格审查分类）
  &cdArea=50170           ← 东京管内（可改为其他管区）
```

---

## 4. 数据维度编码（重要）

### 4.1 在留资格审查类型 (cat02)

| 代码 | 含义 |
|---|---|
| `100` | 资格取得 |
| `110` | 期间更新 |
| `120` | 资格变更 |
| `130` | 资格外活动 |
| `140` | 再入国 |
| **`150`** | **永住** ← 我们需要的 |

### 4.2 受理·处理状态 (cat01)

| 代码 | 含义 | 用途 |
|---|---|---|
| `100` | 受理_总数 | 总申请数 |
| `120` | 受理_旧受 | 上期遗留 |
| `130` | 受理_新受 | **新增申请数** |
| `220` | 既济_总数 | 已处理总数 |
| `230` | 既济_许可 | **批准数** |
| `240` | 既济_不许可 | **拒绝数** |
| `270` | 既济_其他 | 其他结案 |
| `380` | 未济 | **积压待处理数** |

### 4.3 地区编码 (area)

| 代码 | 管区 |
|---|---|
| `50000` | 总数（全国） |
| `50010` | 札幌管内 |
| `50090` | 仙台管内 |
| `50170` | 东京管内 |
| `50320` | 名古屋管内 |
| `50430` | 大阪管内 |
| `50550` | 广岛管内 |
| `50640` | 高松管内 |
| `50690` | 福冈管内 |

### 4.4 时间编码 (time)

格式为 `YYYY000000`（年次），如 `2024000000` = 2024年

---

## 5. 前端集成方案

### 5.1 架构设计

```
用户浏览器
    ↓
React 前端 (Vite)
    ↓
后端 API 代理 (/api/estat/*)     ← 隐藏 appId，避免 CORS
    ↓
e-Stat API (api.e-stat.go.jp)
```

> **重要**：e-Stat API 不支持浏览器端 CORS 直接调用，必须通过后端代理。

### 5.2 后端代理实现（Node.js / Express）

```javascript
// server/index.js
import express from 'express';

const app = express();
const ESTAT_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json';
const APP_ID = process.env.ESTAT_APP_ID;

// 获取永住申请数据（按地区）
app.get('/api/estat/eiju-stats', async (req, res) => {
  const { area = '50000', startYear = '2015', endYear = '2024' } = req.query;

  // 构造时间范围参数
  const timeFrom = `${startYear}000000`;
  const timeTo = `${endYear}000000`;

  const url = new URL(`${ESTAT_BASE}/getStatsData`);
  url.searchParams.set('appId', APP_ID);
  url.searchParams.set('statsDataId', '0003288730');
  url.searchParams.set('cdCat02', '150');        // 永住
  url.searchParams.set('cdArea', area);           // 地区
  url.searchParams.set('cdTimeFrom', timeFrom);
  url.searchParams.set('cdTimeTo', timeTo);

  const response = await fetch(url.toString());
  const data = await response.json();

  // 解析 e-Stat 的嵌套 JSON，转换为简洁格式
  const result = parseEstatResponse(data);
  res.json(result);
});

// 获取各地区对比数据
app.get('/api/estat/region-compare', async (req, res) => {
  const { year = '2024' } = req.query;
  const regions = ['50010','50090','50170','50320','50430','50550','50640','50690'];

  const results = await Promise.all(regions.map(async (area) => {
    const url = new URL(`${ESTAT_BASE}/getStatsData`);
    url.searchParams.set('appId', APP_ID);
    url.searchParams.set('statsDataId', '0003288730');
    url.searchParams.set('cdCat02', '150');
    url.searchParams.set('cdArea', area);
    url.searchParams.set('cdTime', `${year}000000`);

    const response = await fetch(url.toString());
    return response.json();
  }));

  res.json(results.map(parseEstatResponse));
});

function parseEstatResponse(data) {
  const statsData = data?.GET_STATS_DATA?.STATISTICAL_DATA;
  if (!statsData) return null;

  const classInfo = statsData.CLASS_INF?.CLASS_OBJ || [];
  const dataValues = statsData.DATA_INF?.VALUE || [];

  return dataValues.map(v => ({
    value: Number(v.$),
    cat01: v['@cat01'],   // 受理·处理状态
    cat02: v['@cat02'],   // 在留资格类型
    area: v['@area'],     // 地区
    time: v['@time'],     // 时间
  }));
}

app.listen(3001, () => console.log('API proxy running on :3001'));
```

### 5.3 前端调用示例

```javascript
// src/services/estatApi.js
const API_BASE = '/api/estat';

export async function fetchEijuStats(area = '50170', startYear = 2015) {
  const res = await fetch(
    `${API_BASE}/eiju-stats?area=${area}&startYear=${startYear}&endYear=2024`
  );
  const data = await res.json();
  return transformToChartData(data);
}

function transformToChartData(raw) {
  // 按年份分组
  const byYear = {};

  raw.forEach(item => {
    const year = item.time.substring(0, 4);
    if (!byYear[year]) byYear[year] = {};

    // cat01 编码映射
    const labels = {
      '130': 'newApps',     // 新受（新增申请）
      '230': 'approved',    // 既济_许可
      '240': 'rejected',    // 既济_不许可
      '380': 'pending',     // 未济（积压）
    };

    const key = labels[item.cat01];
    if (key) byYear[year][key] = item.value;
  });

  return Object.entries(byYear)
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year.localeCompare(b.year));
}
```

### 5.4 计算审批天数的算法

```javascript
// 预估审批天数 = (未济数 / 月均处理数) × 30
function estimateProcessingDays(pending, monthlyProcessed) {
  if (!monthlyProcessed || monthlyProcessed <= 0) return null;
  return Math.round((pending / monthlyProcessed) * 30);
}

// 许可率 = 许可数 / (许可数 + 不许可数) × 100
function approvalRate(approved, rejected) {
  const total = approved + rejected;
  if (total === 0) return 0;
  return ((approved / total) * 100).toFixed(1);
}
```

---

## 6. 数据获取频率与缓存策略

| 策略 | 说明 |
|---|---|
| **官方更新频率** | 月次数据通常延迟 2-3 个月发布 |
| **建议拉取频率** | 每天 1 次（通过 cron job 或定时任务） |
| **缓存方案** | 将 API 结果缓存到 JSON 文件或数据库，前端从缓存读取 |
| **降级方案** | API 不可用时使用上次缓存的数据 |

```javascript
// server/cache.js — 简易文件缓存
import fs from 'fs';
import path from 'path';

const CACHE_DIR = './data/cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

export function getCached(key) {
  const file = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return null;

  const stat = fs.statSync(file);
  if (Date.now() - stat.mtimeMs > CACHE_TTL) return null;

  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function setCache(key, data) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, `${key}.json`),
    JSON.stringify(data, null, 2)
  );
}
```

---

## 7. 完整的 API 请求示例

### 获取东京管内 2024 年永住申请数据

```bash
curl "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?\
appId=YOUR_APP_ID&\
statsDataId=0003288730&\
cdCat02=150&\
cdArea=50170&\
cdTime=2024000000"
```

### 返回数据结构（简化）

```json
{
  "GET_STATS_DATA": {
    "RESULT": { "STATUS": 0, "ERROR_MSG": "正常に処理されました。" },
    "STATISTICAL_DATA": {
      "CLASS_INF": {
        "CLASS_OBJ": [
          { "@id": "cat01", "CLASS": [
            { "@code": "100", "@name": "受理_総数" },
            { "@code": "130", "@name": "受理_新受" },
            { "@code": "230", "@name": "既済_許可" },
            { "@code": "240", "@name": "既済_不許可" },
            { "@code": "380", "@name": "未済" }
          ]},
          { "@id": "cat02", "CLASS": [
            { "@code": "150", "@name": "永住" }
          ]}
        ]
      },
      "DATA_INF": {
        "VALUE": [
          { "@cat01": "130", "@cat02": "150", "@area": "50170", "@time": "2024000000", "$": "8523" },
          { "@cat01": "230", "@cat02": "150", "@area": "50170", "@time": "2024000000", "$": "3412" },
          { "@cat01": "240", "@cat02": "150", "@area": "50170", "@time": "2024000000", "$": "892" },
          { "@cat01": "380", "@cat02": "150", "@area": "50170", "@time": "2024000000", "$": "12500" }
        ]
      }
    }
  }
}
```

---

## 8. 实施步骤清单

- [ ] **Step 1**：在 e-Stat 注册账号，获取 `appId`
- [ ] **Step 2**：创建后端代理服务器（Express），将 `appId` 存为环境变量 `ESTAT_APP_ID`
- [ ] **Step 3**：实现 `/api/estat/eiju-stats` 端点，获取永住申请受理/处理数据
- [ ] **Step 4**：实现 `/api/estat/region-compare` 端点，获取各地区对比数据
- [ ] **Step 5**：实现 e-Stat JSON 解析器 `parseEstatResponse()`
- [ ] **Step 6**：实现前端 `estatApi.js` 服务层，替换 `mockData.js`
- [ ] **Step 7**：实现审批天数预估算法和许可率计算
- [ ] **Step 8**：添加文件缓存，设置每日定时拉取
- [ ] **Step 9**：添加 fallback 降级，API 异常时显示缓存数据
- [ ] **Step 10**：部署时配置环境变量 `ESTAT_APP_ID`

---

## 9. 环境变量

```bash
# .env（不提交到 Git）
ESTAT_APP_ID=your_application_id_here
```

---

## 参考链接

- e-Stat API 文档：https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0
- 出入国管理統計一覧：https://www.e-stat.go.jp/statistics/00250011
- 永住许可人员表：https://www.e-stat.go.jp/stat-search/database?statdisp_id=0003289203
- 在留资格审查受理处理表：https://ecitizen.jp/Statdb/StatsMeta/0003288730
