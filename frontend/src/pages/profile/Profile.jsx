import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ProfileTabs from '../../components/profile/ProfileTabs';
import PrivateInfoTab from '../../components/profile/PrivateInfoTab';
import SalaryInfoTab from '../../components/profile/SalaryInfoTab';
import ResumeTab from '../../components/profile/ResumeTab';
import EditEmployeeModal from '../../components/employees/EditEmployeeModal';
import SalaryFormModal from '../../components/employees/SalaryFormModal';
import { getEmployee, getSalary, checkIn, checkOut } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const targetId = id || user.id;
  const isSelf = String(targetId) === String(user.id);
  const isAdmin = user.role === 'admin' || user.role === 'hr';

  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [activeTab, setActiveTab] = useState('Private Info');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  const loadEmployee = () => {
    getEmployee(targetId).then(({ data }) => setEmployee(data));
  };

  const loadSalary = () => {
    if (isSelf || isAdmin) {
      getSalary(targetId)
        .then(({ data }) => setSalary(data))
        .catch(() => setSalary(null));
    }
  };

  useEffect(() => {
    loadEmployee();
    loadSalary();
  }, [targetId]);

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('Checked in successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success('Checked out successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not check out');
    }
  };

  if (!employee) return <div className="empty-state">Loading profile...</div>;

  const canSeeSalary = isSelf || isAdmin;

  return (
    <div>
      <ProfileTabs active={activeTab} onChange={setActiveTab} showSalary={canSeeSalary} />

      <div className="profile-layout">
        <div className="profile-side">
          <Avatar firstName={employee.first_name} lastName={employee.last_name} size="lg" />
          <h2>{employee.first_name} {employee.last_name}</h2>
          <p>{employee.job_title}</p>
          <p>{employee.department}</p>

          {isSelf && (
            <div className="profile-actions" style={{ marginTop: 16 }}>
              <Button variant="outline" size="sm" onClick={handleCheckIn}>Check In</Button>
              <Button variant="outline" size="sm" onClick={handleCheckOut}>Check Out</Button>
            </div>
          )}

          {isAdmin && !isSelf && (
            <div className="profile-actions" style={{ marginTop: 16 }}>
              <Button size="sm" onClick={() => setEditModalOpen(true)}>Edit Employee</Button>
              <Button variant="outline" size="sm" onClick={() => setSalaryModalOpen(true)}>
                {salary ? 'Edit Salary' : 'Set Salary'}
              </Button>
            </div>
          )}
        </div>

        <div>
          {activeTab === 'Resume' && <ResumeTab employee={employee} isSelf={isSelf} onUpdated={loadEmployee} />}
          {activeTab === 'Private Info' && <PrivateInfoTab employee={employee} />}
          {activeTab === 'Salary Info' && canSeeSalary && <SalaryInfoTab salary={salary} />}
        </div>
      </div>

      {editModalOpen && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setEditModalOpen(false)}
          onSaved={() => {
            setEditModalOpen(false);
            loadEmployee();
            toast.success('Employee details updated');
          }}
        />
      )}

      {salaryModalOpen && (
        <SalaryFormModal
          userId={targetId}
          salary={salary}
          onClose={() => setSalaryModalOpen(false)}
          onSaved={() => {
            setSalaryModalOpen(false);
            loadSalary();
            toast.success(salary ? 'Salary updated' : 'Salary set successfully');
          }}
        />
      )}
    </div>
  );
}
