import './StatsCard.css';

export default function StatsCard({ icon, label, value, unit, color }) {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-icon" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="stats-info">
        <span className="stats-value" style={{ color }}>{value}</span>
        <span className="stats-unit">{unit}</span>
      </div>
      <div className="stats-label">{label}</div>
    </div>
  );
}
