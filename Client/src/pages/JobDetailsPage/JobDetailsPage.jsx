import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton/BackButton';
import './JobDetailsPage.css';

const getDynamicBenefits = (job) => {
  if (!job) return [];
  
  // Try to parse benefits from the description if it contains "Quyền lợi" or "Benefits"
  const desc = job.description || '';
  const benefitsIndex = desc.toLowerCase().indexOf('quyền lợi');
  const welfareIndex = desc.toLowerCase().indexOf('chế độ');
  const benefitsEnIndex = desc.toLowerCase().indexOf('benefit');

  // If we find a section header, we can try to extract lines following it
  let parsedBenefits = [];
  let startIndex = Math.max(benefitsIndex, welfareIndex, benefitsEnIndex);
  if (startIndex !== -1) {
    const rawSection = desc.substring(startIndex);
    let endIndex = rawSection.length;
    const reqHeaders = ['yêu cầu', 'kỹ năng', 'requirements', 'mô tả', 'description'];
    for (const header of reqHeaders) {
      const idx = rawSection.toLowerCase().indexOf(header, 20); // skip the start
      if (idx !== -1 && idx < endIndex) {
        endIndex = idx;
      }
    }
    const sectionText = rawSection.substring(0, endIndex);
    const lines = sectionText.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('+') || line.startsWith('✓') || line.startsWith('*') || (line.length > 5 && !line.toLowerCase().includes('quyền lợi') && !line.toLowerCase().includes('benefit')));
    
    if (lines.length > 0) {
      parsedBenefits = lines.slice(0, 6);
    }
  }

  if (parsedBenefits.length > 0) {
    return parsedBenefits;
  }

  // Fallback: Generate dynamic benefits based on job attributes
  const benefits = [];
  if (job.salary && job.salary.toLowerCase() !== 'thỏa thuận') {
    benefits.push(`Mức lương hấp dẫn: ${job.salary}, cam kết cạnh tranh so với thị trường.`);
  } else {
    benefits.push('Mức lương thỏa thuận hấp dẫn, tương xứng với năng lực và kinh nghiệm thực tế.');
  }

  if (job.jobType === 'REMOTE') {
    benefits.push('Chế độ làm việc từ xa (Remote 100%) linh hoạt, cung cấp trang thiết bị làm việc.');
  } else if (job.jobType === 'FREELANCE') {
    benefits.push('Thời gian làm việc tự do, chủ động sắp xếp lịch trình cá nhân.');
  } else {
    benefits.push('Làm việc giờ hành chính từ Thứ 2 đến Thứ 6, nghỉ Thứ 7 và Chủ Nhật.');
  }

  if (job.companyName) {
    benefits.push(`Cơ hội làm việc trực tiếp với đội ngũ chuyên gia công nghệ tại ${job.companyName}.`);
    benefits.push(`Tham gia các hoạt động teambuilding, du lịch dã ngoại định kỳ cùng tập thể ${job.companyName}.`);
  } else {
    benefits.push('Cơ hội thăng tiến rõ ràng, được làm việc với các công nghệ mới nhất.');
    benefits.push('Tham gia các chương trình đào tạo, hội thảo chuyên sâu để nâng cao tay nghề.');
  }

  benefits.push('Thưởng tháng 13, thưởng hiệu quả công việc và các dịp lễ Tết.');
  benefits.push('Đóng BHXH, BHYT đầy đủ theo quy định của Luật lao động.');

  return benefits;
};

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/jobs/${jobId}`);
        if (response.data && response.data.data) {
          const jobData = response.data.data;
          setJob(jobData);
          setSaved(jobData.isSaved !== undefined ? jobData.isSaved : jobData.saved);
        } else {
          setError('Công việc không còn tồn tại.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết công việc:', err);
        if (err.response && err.response.status === 404) {
          setError('Công việc không còn tồn tại hoặc đã bị gỡ bỏ.');
        } else {
          setError('Đã có lỗi xảy ra khi tải dữ liệu công việc.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  const handleSaveJob = async () => {
    if (!authService.isAuthenticated()) {
      showToast('Vui lòng đăng nhập để lưu công việc này!', 'error');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }

    setSaveLoading(true);
    try {
      const response = await api.post(`/jobs/${jobId}/save`);
      const isSavedNow = response.data.data;
      setSaved(isSavedNow);
      showToast(isSavedNow ? 'Đã lưu công việc thành công!' : 'Đã bỏ lưu công việc.');
    } catch (err) {
      console.error('Lỗi khi lưu công việc:', err);
      showToast('Không thể thực hiện lưu công việc. Vui lòng thử lại.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShareJob = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast('Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!');
      })
      .catch((err) => {
        console.error('Lỗi khi sao chép liên kết:', err);
        showToast('Không thể sao chép liên kết.', 'error');
      });
  };

  if (loading) {
    return (
      <div className="job-details-loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin chi tiết công việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-details-error-container">
        <div className="error-card">
          <svg className="error-icon-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2>Lỗi tải dữ liệu</h2>
          <p>{error}</p>
          <Link to="/jobs" className="error-back-btn">Quay lại danh sách việc làm</Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  // Mock featured and urgent flags in frontend
  const titleLower = (job.title || '').toLowerCase();
  const isFeatured = titleLower.includes('senior') ||
                     titleLower.includes('lead') ||
                     (job.salary && (job.salary.includes('3,') || job.salary.includes('4,')));

  const isUrgent = titleLower.includes('react') ||
                   titleLower.includes('devops') ||
                   (job.postedDate && new Date(job.postedDate) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));

  const formatJobType = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'Toàn thời gian';
      case 'PART_TIME': return 'Bán thời gian';
      case 'REMOTE': return 'Làm việc từ xa';
      case 'FREELANCE': return 'Tự do';
      default: return type || 'Chưa xác định';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Vừa xong';
    const date = new Date(dateString);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Hôm nay';
    if (diffDays === 2) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="job-details-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="job-details-header">
        <BackButton to="/jobs" label="Danh sách việc làm" />
      </div>

      <div className="job-details-content">
        {/* Banner chính thông tin job */}
        <div className="job-main-card">
          <div className="job-main-header">
            <div className="company-logo-large">
              {job.logoUrl ? (
                <img src={job.logoUrl} alt={job.companyName} />
              ) : (
                <div className="company-logo-placeholder">
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
            </div>
            <div className="job-header-info">
              <div className="job-badges">
                {isFeatured && <span className="badge badge-featured">Nổi bật</span>}
                {isUrgent && <span className="badge badge-urgent">Tuyển gấp</span>}
              </div>
              <h1 className="job-title-large">{job.title}</h1>
              <p className="job-company-name">
                <Link to={`/companies/${job.companyId}`} className="company-link">{job.companyName}</Link>
              </p>
              <div className="job-meta-grid">
                <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.location || 'Hà Nội'}
                </span>
                <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {job.salary || 'Thỏa thuận'}
                </span>
                <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatJobType(job.jobType)}
                </span>
                <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Đăng {formatDate(job.postedDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="job-action-bar">
            <button className="apply-now-btn" onClick={() => showToast('Chức năng ứng tuyển đang được cập nhật!', 'info')}>
              Ứng tuyển ngay
            </button>
            <button
              className={`save-job-btn ${saved ? 'saved' : ''}`}
              onClick={handleSaveJob}
              disabled={saveLoading}
            >
              <svg className="heart-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {saved ? 'Đã lưu' : 'Lưu tin'}
            </button>
            <button className="share-job-btn" onClick={handleShareJob}>
              <svg className="share-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Cấu trúc 2 cột thông tin chi tiết */}
        <div className="job-details-layout">
          {/* Cột trái: Chi tiết công việc */}
          <div className="layout-left-column">
            <div className="detail-section">
              <h2>Mô tả công việc</h2>
              <div className="section-content text-formatting">
                {job.description ? (
                  job.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p>Chưa cập nhật mô tả chi tiết công việc.</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h2>Yêu cầu ứng viên</h2>
              <div className="section-content text-formatting">
                {job.requirements ? (
                  job.requirements.split('\n').map((req, i) => <p key={i}>{req}</p>)
                ) : (
                  <p>Không có yêu cầu đặc biệt nào.</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h2>Quyền lợi được hưởng</h2>
              <div className="section-content text-formatting">
                {getDynamicBenefits(job).map((benefit, idx) => {
                  const hasBullet = (/^[✓\-*+]/).test(benefit);
                  return (
                    <p key={idx}>{hasBullet ? benefit : `✓ ${benefit}`}</p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin công ty */}
          <div className="layout-right-column">
            <div className="company-sidebar-card">
              <h3>Thông tin công ty</h3>
              <div className="company-sidebar-header">
                {job.logoUrl ? (
                  <img src={job.logoUrl} alt={job.companyName} className="company-sidebar-logo" />
                ) : (
                  <div className="company-sidebar-logo-placeholder">
                    {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <h4>{job.companyName}</h4>
                  <p className="company-sidebar-industry">{job.industry || 'Lĩnh vực công nghệ IT'}</p>
                </div>
              </div>

              <div className="company-info-list">
                <div className="info-list-item">
                  <span className="info-label">Quy mô:</span>
                  <span className="info-value">{job.size || '50-150 nhân viên'}</span>
                </div>
                <div className="info-list-item">
                  <span className="info-label">Địa điểm:</span>
                  <span className="info-value">{job.location || 'Hà Nội, Việt Nam'}</span>
                </div>
              </div>

              {job.companyDescription && (
                <div className="company-sidebar-desc">
                  <p>{job.companyDescription}</p>
                </div>
              )}

              <Link to={`/companies/${job.companyId}`} className="view-company-btn">Xem trang công ty</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
