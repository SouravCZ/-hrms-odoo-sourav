import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import BalanceCard from '../../components/timeoff/BalanceCard';
import TimeOffTable from '../../components/timeoff/TimeOffTable';
import TimeOffRequestModal from '../../components/timeoff/TimeOffRequestModal';
import Button from '../../components/ui/Button';
import { getLeaveBalances, getMyLeaveRequests } from '../../services/api';

export default function EmployeeView() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    getLeaveBalances().then(({ data }) => setBalances(data));
    getMyLeaveRequests().then(({ data }) => setRequests(data));
  };

  useEffect(load, []);

  const paidBalance = balances.find((b) => b.leave_type === 'paid');
  const sickBalance = balances.find((b) => b.leave_type === 'sick');

  return (
    <div>
      <div className="page-header">
        <h1>Time Off</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Request
        </Button>
      </div>

      <div className="balance-row">
        <BalanceCard label="Paid Time Off" days={paidBalance?.remaining ?? 0} />
        <BalanceCard label="Sick Time Off" days={sickBalance?.remaining ?? 0} />
      </div>

      <TimeOffTable mode="employee" rows={requests} />

      {modalOpen && (
        <TimeOffRequestModal
          onClose={() => setModalOpen(false)}
          onSubmitted={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
