import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2 } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

function getAttendanceDot(employee) {
  if (employee.check_out) return 'checked-out';
  if (employee.check_in) return 'working';
  return employee.status || 'absent';
}

export default function EmployeeCard({ employee }) {
  const navigate = useNavigate();
  const dotStatus = getAttendanceDot(employee);

  return (
    <Card className="employee-card" onClick={() => navigate(`/profile/${employee.id}`)}>
      <div className="employee-card-header">
        <Avatar firstName={employee.first_name} lastName={employee.last_name} status={dotStatus} />
      </div>
      <div className="employee-card-info">
        <h4>{employee.first_name} {employee.last_name}</h4>
        <div className="employee-card-meta">
          <span className="employee-card-detail">
            <Briefcase size={13} />
            {employee.job_title || '—'}
          </span>
          <span className="employee-card-detail">
            <Building2 size={13} />
            {employee.department || '—'}
          </span>
        </div>
      </div>
      <div className="employee-card-footer">
        <span className={`employee-card-status ${dotStatus}`}>
          {dotStatus === 'working' && 'Working'}
          {dotStatus === 'checked-out' && 'Checked Out'}
          {dotStatus === 'present' && 'Present'}
          {dotStatus === 'absent' && 'Absent'}
          {dotStatus === 'leave' && 'On Leave'}
        </span>
      </div>
    </Card>
  );
}
