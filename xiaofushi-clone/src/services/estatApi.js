/**
 * e-Stat 数据服务层
 *
 * 优先从 public/data/ 静态 JSON 读取（GitHub Pages 模式），
 * 无数据时降级到 mockData。
 */

import {
  regionStats as mockRegionStats,
  accumulatedData as mockAccumulatedData,
  processingByRegion as mockProcessingByRegion,
} from '../data/mockData';

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

async function loadJson(filename) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${filename}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

let _summaryCache = null;
let _allRegionsCache = null;
let _comparisonCache = null;

/**
 * 获取指定地区的统计摘要
 */
export async function fetchRegionSummary(regionId) {
  const areaCode = AREA_CODE_MAP[regionId];
  if (!areaCode) return mockRegionStats[regionId] || null;

  if (!_summaryCache) {
    _summaryCache = await loadJson('region-summary.json');
  }

  const data = _summaryCache?.[areaCode];
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
    _live: true,
  };
}

/**
 * 获取指定地区的年度趋势数据
 */
export async function fetchYearlyTrend(regionId) {
  const areaCode = AREA_CODE_MAP[regionId];
  if (!areaCode) return mockAccumulatedData;

  if (!_allRegionsCache) {
    _allRegionsCache = await loadJson('eiju-all-regions.json');
  }

  const regionData = _allRegionsCache?.[areaCode]?.data;
  if (!regionData || regionData.length === 0) {
    return mockAccumulatedData;
  }

  let runningTotal = 0;
  let runningProcessed = 0;

  return regionData.map((d) => {
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
 * 获取各地区对比数据
 */
export async function fetchRegionComparison() {
  if (!_comparisonCache) {
    _comparisonCache = await loadJson('region-comparison.json');
  }

  if (!_comparisonCache || _comparisonCache.length === 0) {
    return mockProcessingByRegion;
  }

  return _comparisonCache;
}

/**
 * 获取数据元信息
 */
export async function fetchMeta() {
  return loadJson('meta.json');
}
