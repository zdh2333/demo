import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { regions } from '../data/mockData';
import { fetchRegionSummary } from '../services/estatApi';
import './DatePickerModal.css';

export default function DatePickerModal({ onClose }) {
  const { t } = useI18n();
  const [region, setRegion] = useState('tokyo');
  const [date, setDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async () => {
    if (!date) return;
    setLoading(true);
    const summary = await fetchRegionSummary(region);
    setLoading(false);
    const days = summary?.avgDays || 365;
    const submitDate = new Date(date);
    const estDate = new Date(submitDate);
    estDate.setDate(estDate.getDate() + days);
    setResult({ days, estDate });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t('datePicker.title')}</h2>

        <label className="modal-label">{t('datePicker.regionLabel')}</label>
        <select className="modal-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <label className="modal-label">{t('datePicker.dateLabel')}</label>
        <input
          className="modal-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button className="modal-btn-primary" onClick={handleCalc} disabled={!date || loading}>
          {loading ? '...' : t('datePicker.calculate')}
        </button>

        {result && (
          <div className="modal-result">
            <p className="modal-result-date">
              {t('datePicker.resultPrefix')}
              <strong>{result.estDate.toLocaleDateString()}</strong>
            </p>
            <p className="modal-result-days">
              {t('datePicker.resultDays').replace('{days}', result.days)}
            </p>
          </div>
        )}

        <button className="modal-btn-close" onClick={onClose}>{t('datePicker.close')}</button>
      </div>
    </div>
  );
}
