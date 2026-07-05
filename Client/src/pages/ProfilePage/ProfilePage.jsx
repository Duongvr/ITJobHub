import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setUser(currentUser);

    const fetchSavedJobs = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all jobs to inspect their isSaved status
        const response = await api.get('/jobs', { params: { page: 0, size: 1000 } });
        if (response.data && response.data.data) {
          const content = response.data.data.content || [];
          const filtered = content.filter(j => j.isSaved || j.saved);
          setSavedJobs(filtered);
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setError('Không thể tải danh sách công việc đã lưu.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [navigate]);

  const handleUnsave = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await api.post(`/jobs/${jobId}/save`);
      // Since toggleSaveJob returns false when unsaved:
      const isSavedNow = response.data.data;
      if (!isSavedNow) {
        setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
        showToast('Đã bỏ lưu công việc thành công!');
      } else {
        showToast('Đã lưu công việc thành công!');
      }
    } catch (err) {
      console.error('Error unsaving job:', err);
      showToast('Không thể thực hiện hành động. Vui lòng thử lại.', 'error');
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'CANDIDATE') return 'Ứng viên';
    if (role === 'EMPLOYER') return 'Nhà tuyển dụng';
    return role || 'Ứng viên';
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user.fullName || 'Người dùng ITJobHub'}</h2>
          <p className="profile-role-badge">{getRoleLabel(user.role)}</p>
          
          <div className="profile-info-list">
            <div className="profile-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{user.email}</span>
            </div>
            <div className="profile-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Tài khoản: {user.accountStatus === 'VERIFIED' ? 'Đã xác thực' : 'Chưa xác thực'}</span>
            </div>
          </div>
        </div>

        {/* Saved Jobs List */}
        <div className="profile-jobs-section">
          <h3 className="section-title">Công việc đã lưu ({savedJobs.length})</h3>

          {loading ? (
            <div className="profile-jobs-loading">
              <div className="spinner"></div>
              <p>Đang tải danh sách công việc đã lưu...</p>
            </div>
          ) : error ? (
            <div className="profile-jobs-error">{error}</div>
          ) : savedJobs.length === 0 ? (
            <div className="profile-jobs-empty">
              <div className="empty-icon">❤️</div>
              <h4>Chưa có công việc nào được lưu</h4>
              <p>Hãy khám phá các cơ hội việc làm hấp dẫn và nhấn lưu để xem lại sau.</p>
              <Link to="/jobs" className="explore-jobs-btn">Tìm việc ngay</Link>
            </div>
          ) : (
            <div className="profile-jobs-list">
              {savedJobs.map(job => (
                <div key={job.jobId} className="profile-job-card">
                  <div className="profile-job-card-header">
                    <div className="profile-company-logo">
                      {job.logoUrl ? (
                        <img src={job.logoUrl} alt={job.companyName} />
                      ) : (
                        <div className="profile-company-logo-placeholder">
                          {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                    </div>
                    <div className="profile-job-title-info">
                      <Link to={`/jobs/${job.jobId}`} className="profile-job-title-link">
                        <h4>{job.title}</h4>
                      </Link>
                      <p className="profile-job-company">{job.companyName}</p>
                    </div>
                    <button 
                      className="profile-unsave-btn" 
                      onClick={(e) => handleUnsave(job.jobId, e)}
                      title="Bỏ lưu công việc"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="profile-job-card-details">
                    <div className="profile-detail-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      {job.salary || 'Thương lượng'}
                    </div>
                    <div className="profile-detail-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {job.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
