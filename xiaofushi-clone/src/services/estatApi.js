/**
 * e-Stat API 前端服务层
 *
 * 通过后端代理 (/api/estat/*) 访问 e-Stat 数据。
 * 当后端不可用时，自动降级到 mockData。
 */

import {
  regionStats as mockRegionStats,
  accumulatedData as mockAccumulatedData,
  monthlyNewData as mockMonthlyNewData,
  processingByRegion as mockProcessingByRegion,
} from '../data/mockData';

const API_BASE = 'http://localhost:3001/api/estat';

const AREA_CODE_MAP = {
  tokyo: '50170',
  osaka: '50430',
  nagoya: '50320',
  fukuoka: '50690',
  sapporo: '50010',
  hiroshima: '50550',
  sendai: '50090',
  takamatsu: '50640',
};

async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 获取指定地区的统计摘要（审批天数、许可率、待处理数）
 */
export async function fetchRegionSummary(regionId) {
  const areaCode = AREA_CODE_MAP[regionId];
  if (!areaCode) return mockRegionStats[regionId] || null;

  const data = await safeFetch(`${API_BASE}/summary?area=${areaCode}`);
  if (!data || data.error) {
    return mockRegionStats[regionId] || null;
  }

  return {
    avgDays: data.estimatedDays || 0,
    approvalRate: data.approvalRate || 0,
    pending: data.pending || 0,
    newApps: data.newApps || 0,
    approved: data.approved || 0,
    rejected: data.rejected || 0,
    _live: !data._stale,
  };
}

/**
 * 获取指定地区的年度趋势数据（累计图表用）
 */
export async function fetchYearlyTrend(regionId, startYear = 2010) {
  const areaCode = AREA_CODE_MAP[regionId];
  if (!areaCode) return mockAccumulatedData;

  const data = await safeFetch(
    `${API_BASE}/eiju-stats?area=${areaCode}&startYear=${startYear}`,
  );
  if (!data || data.error || !data.data) {
    return mockAccumulatedData;
  }

  let runningTotal = 0;
  let runningProcessed = 0;

  return data.data.map((d) => {
    runningTotal += d.newApps || 0;
    runningProcessed += (d.approved || 0) + (d.rejected || 0) + (d.other || 0);
    return {
      month: d.year,
      total: runningTotal,
      processed: runningProcessed,
      newApps: d.newApps || 0,
      approved: d.approved || 0,
      rejected: d.rejected || 0,
    };
  });
}

/**
 * 获取各地区对比数据（横向柱状图用）
 */
export async function fetchRegionComparison() {
  const data = await safeFetch(`${API_BASE}/region-compare`);
  if (!data || data.error || !Array.isArray(data)) {
    return mockProcessingByRegion;
  }

  return data
    .filter((r) => r.estimatedDays)
    .map((r) => ({
      region: r.areaName,
      days: r.estimatedDays,
      approvalRate: r.approvalRate,
    }))
    .sort((a, b) => b.days - a.days);
}

/**
 * 检查后端 API 是否可用
 */
export async function checkApiHealth() {
  try {
    const res = await fetch('http://localhost:3001/api/health', {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
