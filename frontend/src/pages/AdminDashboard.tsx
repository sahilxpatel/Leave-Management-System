import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { clearAuth } from '../api';
import StatusBadge from '../components/StatusBadge';

type Message = { type: 'success' | 'error'; text: string };

type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface LeaveRequest {
  id: number;
  user_id: number;
  name: string;
  email: string;
  reason: string;
  status: LeaveStatus;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Admin';
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchLeaves = async () => {
    try {
      const response = await api.get<LeaveRequest[]>('/all-leaves');
      setLeaves(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Unable to load leaves';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdate = async (id: number, status: LeaveStatus) => {
    setActionId(id);
    setMessage(null);

    try {
      const response = await api.put<LeaveRequest>(`/leave/${id}`, { status });
      setLeaves((prev) => prev.map((leave) => (leave.id === id ? response.data : leave)));
      setMessage({ type: 'success', text: `Leave ${status.toLowerCase()}.` });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Unable to update leave';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  return (
    <div className="card">
      <div className="topbar">
        <div className="meta">
          <div className="section-title">Welcome {name}</div>
          <span className="muted">Review and action leave requests.</span>
        </div>
        <button className="button secondary" onClick={handleLogout}>Log out</button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="kpi">
          <strong>{leaves.length}</strong>
          <span>total requests</span>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading requests...</p>
      ) : leaves.length === 0 ? (
        <p className="muted">No leave requests available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>
                  <strong>{leave.name}</strong>
                  <div className="muted" style={{ fontSize: '12px' }}>{leave.email}</div>
                </td>
                <td>{leave.reason}</td>
                <td><StatusBadge status={leave.status} /></td>
                <td>{formatDate(leave.created_at)}</td>
                <td>
                  {leave.status === 'PENDING' ? (
                    <div className="actions">
                      <button
                        className="button"
                        disabled={actionId === leave.id}
                        onClick={() => handleUpdate(leave.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        className="button danger"
                        disabled={actionId === leave.id}
                        onClick={() => handleUpdate(leave.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="muted">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
