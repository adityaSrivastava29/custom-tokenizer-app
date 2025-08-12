export default function Stat({ label, value }) {
  return (
    <div className="ct-stat">
      <div className="ct-stat-value">{value}</div>
      <div className="ct-stat-label">{label}</div>
    </div>
  );
}


