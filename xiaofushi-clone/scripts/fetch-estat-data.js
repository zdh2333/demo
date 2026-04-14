/**
 * e-Stat 数据抓取脚本
 *
 * 通过 GitHub Actions 定时运行，将 e-Stat API 数据写入 public/data/ 目录，
 * 前端直接读取静态 JSON，无需后端服务器。
 *
 * 环境变量：ESTAT_APP_ID
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../public/data');
const ESTAT_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json';
const STATS_DATA_ID = '0003288730';
const EIJU_CODE = '150';

const APP_ID = process.env.ESTAT_APP_ID;
if (!APP_ID) {
  console.error('Error: ESTAT_APP_ID environment variable not set');
  process.exit(1);
}

const REGIONS = {
  '50000': '全国',
  '50010': '札幌',
  '50090': '仙台',
  '50170': '东京',
  '50320': '名古屋',
  '50430': '大阪',
  '50550': '广岛',
  '50640': '高松',
  '50690': '福冈',
};

const CAT01_LABELS = {
  '100': 'totalReceived',
  '120': 'carryOver',
  '130': 'newApps',
  '220': 'totalProcessed',
  '230': 'approved',
  '240': 'rejected',
  '270': 'other',
  '380': 'pending',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchEstat(params) {
  const url = new URL(`${ESTAT_BASE}/getStatsData`);
  url.searchParams.set('appId', APP_ID);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`e-Stat responded ${res.status}: ${await res.text()}`);
  return res.json();
}

function parseResponse(data) {
  const values = data?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!values) return [];
  const arr = Array.isArray(values) ? values : [values];

  return arr.map((v) => ({
    value: v.$ === '-' ? null : Number(v.$),
    cat01: v['@cat01'],
    cat01Label: CAT01_LABELS[v['@cat01']] || v['@cat01'],
    area: v['@area'],
    areaName: REGIONS[v['@area']] || v['@area'],
    year: v['@time']?.substring(0, 4),
  }));
}

function groupByYear(records) {
  const map = {};
  for (const r of records) {
    if (!r.year || r.value === null) continue;
    if (!map[r.year]) map[r.year] = { year: r.year };
    map[r.year][r.cat01Label] = r.value;
  }
  return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

function calcStats(yearData) {
  if (!yearData) return {};
  const approved = yearData.approved || 0;
  const rejected = yearData.rejected || 0;
  const pending = yearData.pending || 0;
  const totalProcessed = yearData.totalProcessed || 0;
  const monthlyProcessed = totalProcessed / 12;

  return {
    newApps: yearData.newApps || 0,
    approved,
    rejected,
    pending,
    approvalRate: approved + rejected > 0
      ? Number(((approved / (approved + rejected)) * 100).toFixed(1))
      : 0,
    estimatedDays: monthlyProcessed > 0
      ? Math.round((pending / monthlyProcessed) * 30)
      : null,
  };
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Output directory: ${DATA_DIR}`);
  console.log(`Fetching data for ${Object.keys(REGIONS).length} regions...`);

  const allRegionData = {};
  const regionSummary = {};

  for (const [areaCode, areaName] of Object.entries(REGIONS)) {
    console.log(`  Fetching: ${areaName} (${areaCode})...`);

    try {
      const raw = await fetchEstat({
        statsDataId: STATS_DATA_ID,
        cdCat02: EIJU_CODE,
        cdArea: areaCode,
        cdTimeFrom: '2006000000',
        cdTimeTo: '2025000000',
      });

      const records = parseResponse(raw);
      const byYear = groupByYear(records);
      allRegionData[areaCode] = { area: areaCode, areaName, data: byYear };

      const latestYear = byYear[byYear.length - 1];
      regionSummary[areaCode] = {
        area: areaCode,
        areaName,
        ...calcStats(latestYear),
        latestYear: latestYear?.year,
      };

      console.log(`    ✓ ${byYear.length} years of data`);
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`);
      allRegionData[areaCode] = { area: areaCode, areaName, data: [], error: err.message };
      regionSummary[areaCode] = { area: areaCode, areaName, error: err.message };
    }

    await sleep(1000);
  }

  // 各地区年度趋势数据
  fs.writeFileSync(
    path.join(DATA_DIR, 'eiju-all-regions.json'),
    JSON.stringify(allRegionData, null, 2),
  );
  console.log('Wrote eiju-all-regions.json');

  // 各地区摘要（首页卡片用）
  fs.writeFileSync(
    path.join(DATA_DIR, 'region-summary.json'),
    JSON.stringify(regionSummary, null, 2),
  );
  console.log('Wrote region-summary.json');

  // 各地区对比数据（横向柱状图用）
  const comparison = Object.values(regionSummary)
    .filter((r) => r.estimatedDays && r.area !== '50000')
    .map((r) => ({
      region: r.areaName,
      days: r.estimatedDays,
      approvalRate: r.approvalRate,
    }))
    .sort((a, b) => b.days - a.days);

  fs.writeFileSync(
    path.join(DATA_DIR, 'region-comparison.json'),
    JSON.stringify(comparison, null, 2),
  );
  console.log('Wrote region-comparison.json');

  // 元数据
  const meta = {
    lastUpdated: new Date().toISOString(),
    source: 'e-Stat API v3.0 (https://api.e-stat.go.jp)',
    statsDataId: STATS_DATA_ID,
    regionsCount: Object.keys(REGIONS).length,
  };
  fs.writeFileSync(
    path.join(DATA_DIR, 'meta.json'),
    JSON.stringify(meta, null, 2),
  );
  console.log('Wrote meta.json');

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
