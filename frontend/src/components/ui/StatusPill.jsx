export default function StatusPill({ status }) {
  const label = status ? status[0].toUpperCase() + status.slice(1) : '';
  return <span className={`pill ${status}`}>{label}</span>;
}
