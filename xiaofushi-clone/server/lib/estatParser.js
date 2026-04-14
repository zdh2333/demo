/**
 * e-Stat API JSON 响应解析器
 *
 * e-Stat 返回的 JSON 结构为深嵌套格式，此模块将其转化为扁平化可用数据。
 */

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

const AREA_NAMES = {
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

export function parseEstatResponse(data) {
  const statsData = data?.GET_STATS_DATA?.STATISTICAL_DATA;
  if (!statsData) return [];

  const values = statsData.DATA_INF?.VALUE;
  if (!values) return [];

  const arr = Array.isArray(values) ? values : [values];

  return arr.map((v) => ({
    value: v.$ === '-' ? null : Number(v.$),
    cat01: v['@cat01'],
    cat01Label: CAT01_LABELS[v['@cat01']] || v['@cat01'],
    cat02: v['@cat02'],
    area: v['@area'],
    areaName: AREA_NAMES[v['@area']] || v['@area'],
    time: v['@time'],
    year: v['@time']?.substring(0, 4),
  }));
}

export function groupByYear(records) {
  const map = {};
  for (const r of records) {
    if (!r.year || r.value === null) continue;
    if (!map[r.year]) map[r.year] = { year: r.year };
    map[r.year][r.cat01Label] = r.value;
  }
  return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

export function groupByRegion(records) {
  const map = {};
  for (const r of records) {
    if (r.value === null) continue;
    const key = r.area;
    if (!map[key]) map[key] = { area: r.area, areaName: r.areaName };
    map[key][r.cat01Label] = r.value;
  }
  return Object.values(map);
}

export function estimateProcessingDays(pending, monthlyProcessed) {
  if (!monthlyProcessed || monthlyProcessed <= 0) return null;
  return Math.round((pending / monthlyProcessed) * 30);
}

export function calcApprovalRate(approved, rejected) {
  const total = (approved || 0) + (rejected || 0);
  if (total === 0) return 0;
  return Number(((approved / total) * 100).toFixed(1));
}

export { CAT01_LABELS, AREA_NAMES };
