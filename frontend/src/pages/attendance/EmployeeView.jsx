import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import Card from '../../components/ui/Card';
import { getAttendanceMonth } from '../../services/api';

function monthKey(d) {
  return d.toISOString().slice(0, 7);
}

function formatDisplay(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function EmployeeView() {
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ daysPresent: 0, leaves: 0, totalWorkingDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAttendanceMonth(monthKey(date))
      .then(({ data }) => {
        setRecords(data.records);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const shiftMonth = (delta) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + delta);
    setDate(next);
  };

  return (
    <div>
      <div className="date-nav">
        <div className="date-nav-controls">
          <button onClick={() => shiftMonth(-1)}><ChevronLeft size={16} /></button>
          <span>{formatDisplay(date)}</span>
          <button onClick={() => shiftMonth(1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="stat-row">
        <Card className="stat-chip">
          <div className="stat-chip-icon"><Calendar size={16} /></div>
          <div>
            <div className="stat-chip-label">Days Present</div>
            <div className="stat-chip-value">{summary.daysPresent}</div>
          </div>
        </Card>
        <Card className="stat-chip">
          <div className="stat-chip-icon"><Calendar size={16} /></div>
          <div>
            <div className="stat-chip-label">Leaves</div>
            <div className="stat-chip-value">{summary.leaves}</div>
          </div>
        </Card>
        <Card className="stat-chip">
          <div className="stat-chip-icon"><Calendar size={16} /></div>
          <div>
            <div className="stat-chip-label">Total Working Days</div>
            <div className="stat-chip-value">{summary.totalWorkingDays}</div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="empty-state">Loading attendance...</div>
      ) : (
        <AttendanceTable mode="employee" rows={records} />
      )}
    </div>
  );
}
