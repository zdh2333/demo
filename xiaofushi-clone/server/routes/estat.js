import { Router } from 'express';
import {
  parseEstatResponse,
  groupByYear,
  groupByRegion,
  estimateProcessingDays,
  calcApprovalRate,
  AREA_NAMES,
} from '../lib/estatParser.js';
import { getCached, setCache } from '../lib/cache.js';

export const estatRouter = Router();

const ESTAT_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json';
const STATS_DATA_ID = '0003288730'; // 在留资格审查受理及处理人员
const EIJU_CODE = '150'; // 永住

function getAppId() {
  return process.env.ESTAT_APP_ID;
}

async function fetchEstat(params) {
  const appId = getAppId();
  if (!appId) throw new Error('ESTAT_APP_ID not configured');

  const url = new URL(`${ESTAT_BASE}/getStatsData`);
  url.searchParams.set('appId', appId);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`e-Stat responded ${res.status}`);
  return res.json();
}

// 获取指定地区的永住申请年度趋势数据
estatRouter.get('/eiju-stats', async (req, res) => {
  const { area = '50170', startYear = '2010', endYear = '2024' } = req.query;
  const cacheKey = `eiju-stats-${area}-${startYear}-${endYear}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const raw = await fetchEstat({
      statsDataId: STATS_DATA_ID,
      cdCat02: EIJU_CODE,
      cdArea: area,
      cdTimeFrom: `${startYear}000000`,
      cdTimeTo: `${endYear}000000`,
    });

    const records = parseEstatResponse(raw);
    const byYear = groupByYear(records);
    const result = { area, areaName: AREA_NAMES[area], data: byYear };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    const fallback = getCached(cacheKey, Infinity);
    if (fallback) {
      return res.json({ ...fallback, _stale: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// 获取各地区最新年度对比数据
estatRouter.get('/region-compare', async (req, res) => {
  const { year = '2024' } = req.query;
  const cacheKey = `region-compare-${year}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  const regionCodes = Object.keys(AREA_NAMES).filter((c) => c !== '50000');

  try {
    const results = await Promise.all(
      regionCodes.map(async (area) => {
        const raw = await fetchEstat({
          statsDataId: STATS_DATA_ID,
          cdCat02: EIJU_CODE,
          cdArea: area,
          cdTime: `${year}000000`,
        });
        const records = parseEstatResponse(raw);
        const grouped = groupByRegion(records);
        return grouped[0] || { area, areaName: AREA_NAMES[area] };
      }),
    );

    const enriched = results.map((r) => {
      const monthlyProcessed = (r.totalProcessed || 0) / 12;
      return {
        ...r,
        approvalRate: calcApprovalRate(r.approved, r.rejected),
        estimatedDays: estimateProcessingDays(r.pending, monthlyProcessed),
      };
    });

    setCache(cacheKey, enriched);
    res.json(enriched);
  } catch (err) {
    const fallback = getCached(cacheKey, Infinity);
    if (fallback) {
      return res.json(fallback.map((r) => ({ ...r, _stale: true })));
    }
    res.status(500).json({ error: err.message });
  }
});

// 获取指定地区的统计摘要（用于首页卡片）
estatRouter.get('/summary', async (req, res) => {
  const { area = '50170', year = '2024' } = req.query;
  const cacheKey = `summary-${area}-${year}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const raw = await fetchEstat({
      statsDataId: STATS_DATA_ID,
      cdCat02: EIJU_CODE,
      cdArea: area,
      cdTime: `${year}000000`,
    });

    const records = parseEstatResponse(raw);
    const data = {};
    for (const r of records) {
      data[r.cat01Label] = r.value;
    }

    const monthlyProcessed = (data.totalProcessed || 0) / 12;
    const result = {
      area,
      areaName: AREA_NAMES[area],
      year,
      newApps: data.newApps || 0,
      approved: data.approved || 0,
      rejected: data.rejected || 0,
      pending: data.pending || 0,
      approvalRate: calcApprovalRate(data.approved, data.rejected),
      estimatedDays: estimateProcessingDays(data.pending, monthlyProcessed),
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    const fallback = getCached(cacheKey, Infinity);
    if (fallback) {
      return res.json({ ...fallback, _stale: true });
    }
    res.status(500).json({ error: err.message });
  }
});
