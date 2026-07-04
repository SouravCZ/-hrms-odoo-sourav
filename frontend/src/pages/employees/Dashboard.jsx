import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import EmployeeCard from '../../components/employees/EmployeeCard';
import Button from '../../components/ui/Button';
import { getEmployees } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    if (!isAdmin) return;
    getEmployees()
      .then(({ data }) => setEmployees(data))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter((e) =>
      `${e.first_name} ${e.last_name} ${e.department} ${e.job_title}`.toLowerCase().includes(q)
    );
  }, [employees, query]);

  if (!isAdmin) return null;

  return (
    <div>
      <div className="page-header">
        <div className="searchbar">
          <Search size={16} />
          <input
            placeholder="Search employees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/employees/add')}>
            <Plus size={16} /> Add Employee
          </Button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Loading employees...</div>
      ) : filtered.length ? (
        <div className="employee-grid">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No employees found.</div>
      )}
    </div>
  );
}
