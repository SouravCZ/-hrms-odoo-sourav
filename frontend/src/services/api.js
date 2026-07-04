import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const signupCompany = (data) => api.post('/api/auth/signup-company', data);
export const login = (identifier, password) =>
  api.post('/api/auth/login', { identifier, password });
export const changePassword = (newPassword) =>
  api.post('/api/auth/change-password', { newPassword });

// ---- Employees ----
export const getEmployees = () => api.get('/api/employees');
export const getEmployee = (id) => api.get(`/api/employees/${id}`);
export const createEmployee = (data) => api.post('/api/employees', data);
export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data);
export const updateMyResume = (id, data) => api.put(`/api/employees/${id}/resume`, data);

// ---- Attendance ----
export const checkIn = () => api.post('/api/attendance/check-in');
export const checkOut = () => api.post('/api/attendance/check-out');
export const getMyTodayAttendance = () => api.get('/api/attendance/me/today');
export const getAttendanceDay = (date) => api.get('/api/attendance/day', { params: { date } });
export const getAttendanceMonth = (month) =>
  api.get('/api/attendance/me/month', { params: { month } });

// ---- Leave / Time Off ----
export const getLeaveBalances = () => api.get('/api/leave/balances');
export const getMyLeaveRequests = () => api.get('/api/leave/requests/me');
export const getAllLeaveRequests = (status) =>
  api.get('/api/leave/requests', { params: status ? { status } : {} });
export const submitLeaveRequest = (formData) =>
  api.post('/api/leave/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const reviewLeaveRequest = (id, status) =>
  api.patch(`/api/leave/requests/${id}`, { status });

// ---- Salary ----
export const getSalary = (userId) => api.get(`/api/salary/${userId}`);
export const updateSalary = (userId, data) => api.put(`/api/salary/${userId}`, data);

export default api;
