interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalized = String(status || '').toLowerCase();
  return <span className={`status-badge ${normalized}`}>{status}</span>;
};

export default StatusBadge;
