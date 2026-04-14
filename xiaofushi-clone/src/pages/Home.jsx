import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import StatsCard from '../components/StatsCard';
import FAQ from '../components/FAQ';
import { regions } from '../data/mockData';
import {
  fetchRegionSummary,
  fetchYearlyTrend,
  fetchRegionComparison,
} from '../services/estatApi';
import './Home.css';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState('tokyo');
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [applicationDate, setApplicationDate] = useState('');
  const [estimateResult, setEstimateResult] = useState(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRegionSummary(selectedRegion),
      fetchYearlyTrend(selectedRegion),
    ]).then(([summary, trend]) => {
      setStats(summary);
      setTrendData(trend);
      setLoading(false);
    });
  }, [selectedRegion]);

  useEffect(() => {
    fetchRegionComparison().then(setComparisonData);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  function handleEstimate() {
    if (!applicationDate || !stats) return;
    const start = new Date(applicationDate);
    const avgDays = stats.avgDays || 365;
    const estimated = new Date(start.getTime() + avgDays * 86400000);
    const today = new Date();
    const remaining = Math.max(0, Math.ceil((estimated - today) / 86400000));
    const regionName = regions.find(r => r.id === selectedRegion)?.name || selectedRegion;
    setEstimateResult({ regionName, avgDays, estimated, remaining });
    setShowDatePicker(false);
  }

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">日本永住申请时间预估</h1>
        <p className="hero-desc">
          基于出入国在留管理庁公开数据，为您预估永住申请审批时间
        </p>
        <div className="hero-cta-wrapper" ref={datePickerRef}>
          <button className="hero-cta" onClick={() => setShowDatePicker(!showDatePicker)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            添加我的日期，获取精确预估
          </button>
          {showDatePicker && (
            <div className="date-picker-dropdown">
              <label className="date-picker-label">请选择您的申请提交日期</label>
              <input
                type="date"
                className="date-picker-input"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <button
                className="date-picker-submit"
                onClick={handleEstimate}
                disabled={!applicationDate}
              >
                计算预估结果
              </button>
            </div>
          )}
        </div>
        {estimateResult && (
          <div className="estimate-result">
            <div className="estimate-result-inner">
              <span className="estimate-icon">📅</span>
              <div className="estimate-text">
                <p>
                  基于{estimateResult.regionName}地区平均审批天数
                  <strong> {estimateResult.avgDays} 天</strong>，
                  预估审批完成日期为
                  <strong> {estimateResult.estimated.toLocaleDateString('zh-CN')} </strong>
                </p>
                <p className="estimate-remaining">
                  {estimateResult.remaining > 0
                    ? `距离预估完成还有约 ${estimateResult.remaining} 天`
                    : '已超过预估审批周期，请关注入管局通知'}
                </p>
              </div>
              <button className="estimate-close" onClick={() => setEstimateResult(null)}>✕</button>
            </div>
          </div>
        )}
      </section>

      <section className="region-selector">
        <h2 className="section-title">选择地区</h2>
        <div className="region-buttons">
          {regions.map((r) => (
            <button
              key={r.id}
              className={`region-btn ${selectedRegion === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRegion(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载数据中...</p>
        </div>
      )}

      {!loading && stats && (
        <section className="stats-grid">
          <StatsCard
            icon="⏱"
            label="预估审批天数"
            value={stats.avgDays || '—'}
            unit="天"
            color="#FF7043"
          />
          <StatsCard
            icon="✅"
            label="许可率"
            value={stats.approvalRate || '—'}
            unit="%"
            color="#00C853"
          />
          <StatsCard
            icon="📋"
            label="待处理申请数"
            value={stats.pending ? stats.pending.toLocaleString() : '—'}
            unit="件"
            color="#00BCD4"
          />
        </section>
      )}

      {!loading && trendData.length > 0 && (
        <section className="chart-section">
          <h2 className="section-title">累计申请与处理数据</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="total" name="累计申请" stroke="#FF7043" fill="#FF704320" strokeWidth={2} />
                <Area type="monotone" dataKey="processed" name="累计处理" stroke="#00C853" fill="#00C85320" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {!loading && trendData.length > 0 && (
        <section className="chart-section">
          <h2 className="section-title">每年新增申请数据</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="newApps" name="新增申请" fill="#00BCD4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="许可" fill="#00C853" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="不许可" fill="#FF7043" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {comparisonData.length > 0 && (
        <section className="chart-section">
          <h2 className="section-title">各地区预估审批天数</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="days" name="预估天数" fill="#00C853" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <FAQ />

      <section className="source-section">
        <h2 className="section-title">数据来源</h2>
        <p className="source-desc">
          本站数据来源于出入国在留管理庁公开的「出入国管理統計」，可与官方数据进行比对。
        </p>
        <a
          href="https://www.e-stat.go.jp/dbview?sid=0003449073"
          target="_blank"
          rel="noopener noreferrer"
          className="source-link"
        >
          https://www.e-stat.go.jp/dbview?sid=0003449073
        </a>
      </section>
    </div>
  );
}
