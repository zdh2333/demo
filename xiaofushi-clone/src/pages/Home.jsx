import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import StatsCard from '../components/StatsCard';
import FAQ from '../components/FAQ';
import DatePickerModal from '../components/DatePickerModal';
import { useI18n } from '../contexts/I18nContext';
import { regions } from '../data/mockData';
import {
  fetchRegionSummary,
  fetchYearlyTrend,
  fetchRegionComparison,
} from '../services/estatApi';
import './Home.css';

export default function Home() {
  const { t } = useI18n();
  const [selectedRegion, setSelectedRegion] = useState('tokyo');
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-desc">{t('hero.desc')}</p>
        <button className="hero-cta" onClick={() => setShowDatePicker(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('hero.cta')}
        </button>
      </section>

      {showDatePicker && <DatePickerModal onClose={() => setShowDatePicker(false)} />}

      <section className="region-selector">
        <h2 className="section-title">{t('region.title')}</h2>
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
            label={t('stats.days')}
            value={stats.avgDays || '—'}
            unit={t('stats.dayUnit')}
            color="#FF7043"
          />
          <StatsCard
            icon="✅"
            label={t('stats.rate')}
            value={stats.approvalRate || '—'}
            unit={t('stats.rateUnit')}
            color="#00C853"
          />
          <StatsCard
            icon="📋"
            label={t('stats.pending')}
            value={stats.pending ? stats.pending.toLocaleString() : '—'}
            unit={t('stats.pendingUnit')}
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
                  {regions.find((r) => r.id === selectedRegion)?.nameJa || ''}{t('chart.cumulative')}
                </h3>
                <span className="chart-card-subtitle">
                  {trendData[0]?.month}{t('chart.from')}
                </span>
              </div>
              <div className="chart-card-header-right">
                <span className="chart-card-metric-label">{t('chart.prevTotal')}</span>
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
                <Bar dataKey="pending" name={t('chart.pendingLabel')} fill="#00C853" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {trendData.length > 0 && (
        <section className="chart-section">
          <h2 className="section-title">{t('chart.yearly')}</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="newApps" name={t('chart.newApps')} fill="#00BCD4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name={t('chart.approved')} fill="#00C853" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name={t('chart.rejected')} fill="#FF7043" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {comparisonData.length > 0 && (
        <section className="chart-section">
          <h2 className="section-title">{t('chart.regionCompare')}</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="days" name={t('chart.estDays')} fill="#00C853" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <FAQ />

      <section className="source-section">
        <h2 className="section-title">{t('source.title')}</h2>
        <p className="source-desc">{t('source.desc')}</p>
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
