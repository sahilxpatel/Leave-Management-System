import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { clearAuth } from '../api';
import StatusBadge from '../components/StatusBadge';

type Message = { type: 'success' | 'error'; text: string };

type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Leave {
  id: number;
  reason: string;
  status: LeaveStatus;
  created_at: string;
}

interface LeavesResponse {
  balance: number;
  leaves: Leave[];
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Employee';
  const [balance, setBalance] = useState<number>(Number(localStorage.getItem('leaveBalance') || 0));
  const [reason, setReason] = useState('');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchLeaves = async () => {
    try {
      const response = await api.get<LeavesResponse>('/my-leaves');
      setLeaves(response.data.leaves || []);
      if (typeof response.data.balance === 'number') {
        setBalance(response.data.balance);
        localStorage.setItem('leaveBalance', String(response.data.balance));
      }
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

  const handleApply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/apply-leave', { reason });
      setReason('');
      setMessage({ type: 'success', text: 'Leave request submitted.' });
      await fetchLeaves();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Unable to submit leave';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
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
          <div className="section-title">Hi {name}</div>
          <span className="muted">Track your leave requests and balance.</span>
        </div>
        <button className="button secondary" onClick={handleLogout}>Log out</button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="grid">
        <section>
          <h2 className="section-title">Apply for leave</h2>
          <form onSubmit={handleApply}>
            <label className="label" htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              className="textarea"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Share the reason for your leave"
              required
            />
            <div style={{ marginTop: '16px' }}>
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        </section>
        <section className="panel">
          <h2 className="section-title">Leave balance</h2>
          <div className="kpi">
            <strong>{balance}</strong>
            <span>days available</span>
          </div>
          <p className="muted">Balance updates after approvals.</p>
        </section>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">My requests</h2>
        {loading ? (
          <p className="muted">Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p className="muted">No leave requests yet.</p>
        ) : (
          <div className="list">
            {leaves.map((leave) => (
              <div key={leave.id} className="leave-item">
                <div className="actions" style={{ justifyContent: 'space-between' }}>
                  <strong>{leave.reason}</strong>
                  <StatusBadge status={leave.status} />
                </div>
                <small>Submitted on {formatDate(leave.created_at)}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
