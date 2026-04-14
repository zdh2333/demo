import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
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

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">日本永住申请时间预估</h1>
        <p className="hero-desc">
          基于出入国在留管理庁公开数据，为您预估永住申请审批时间
        </p>
        <button className="hero-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加我的日期，获取精确预估
        </button>
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

      {stats && (
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

      {trendData.length > 0 && (
        <section className="chart-section">
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-header-left">
                <h3 className="chart-card-title">
                  {regions.find((r) => r.id === selectedRegion)?.nameJa || ''}累積データ
                </h3>
                <span className="chart-card-subtitle">
                  {trendData[0]?.month}年から
                </span>
              </div>
              <div className="chart-card-header-right">
                <span className="chart-card-metric-label">前月総数</span>
                <span className="chart-card-metric-value">
                  {trendData[trendData.length - 1]?.pending?.toLocaleString() || '—'}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(trendData.length / 12) - 1)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="pending" name="待处理积压数" fill="#00C853" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {trendData.length > 0 && (
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
