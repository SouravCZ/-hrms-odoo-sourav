import { Calendar } from 'lucide-react';
import Card from '../ui/Card';

export default function BalanceCard({ label, days }) {
  return (
    <Card className="balance-card">
      <div className="balance-card-icon">
        <Calendar size={20} />
      </div>
      <div>
        <div className="balance-card-label">{label}</div>
        <div className="balance-card-value">{days}</div>
        <div className="balance-card-label">Days Available</div>
      </div>
    </Card>
  );
}
