import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton/BackButton';
import './JobsPage.css';

const JobsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params (e.g. from homepage search)
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword') || '';
  const initialLocation = queryParams.get('location') || '';

  // States
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter inputs
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [locationInput, setLocationInput] = useState(initialLocation);
  const [jobTypeFilter, setJobTypeFilter] = useState('');

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Sync keyword input if URL changes
  useEffect(() => {
    setKeywordInput(initialKeyword);
    setLocationInput(initialLocation);
    setPage(0); // Reset page on query param change
  }, [initialKeyword, initialLocation]);

  // Fetch jobs from backend
  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      const params = {
        page,
        size: 10
      };

      // If either keyword or location input is present, call basic search endpoint
      if (initialKeyword.trim() || initialLocation.trim()) {
        params.keyword = initialKeyword.trim();
        params.location = initialLocation.trim();
        response = await api.get('/jobs/search', { params });
      } else {
        // Otherwise load all published jobs (UC_01)
        response = await api.get('/jobs', { params });
      }

      if (response.data && response.data.data) {
        const pagedData = response.data.data;
        setJobs(pagedData.content || []);
        setTotalPages(pagedData.totalPages || 0);
        setTotalElements(pagedData.totalElements || 0);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách công việc:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu công việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, initialKeyword, initialLocation]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams();
    if (keywordInput.trim()) query.set('keyword', keywordInput.trim());
    if (locationInput.trim()) query.set('location', locationInput.trim());
    setPage(0);
    navigate(`/jobs?${query.toString()}`);
  };

  // Quick save toggle
  const handleSaveToggle = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      showToast('Vui lòng đăng nhập để lưu công việc này!', 'error');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }

    try {
      const response = await api.post(`/jobs/${jobId}/save`);
      const isSavedNow = response.data.data;
      
      // Update local state
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === jobId ? { ...job, isSaved: isSavedNow } : job
        )
      );

      showToast(isSavedNow ? 'Đã lưu công việc thành công!' : 'Đã bỏ lưu công việc.');
    } catch (err) {
      console.error('Lỗi khi lưu/bỏ lưu công việc:', err);
      showToast('Không thể thực hiện hành động. Vui lòng thử lại.', 'error');
    }
  };

  // Mock featured/urgent indicators
  const isJobFeatured = (job) => {
    return job.title.toLowerCase().includes('senior') ||
           job.title.toLowerCase().includes('lead') ||
           (job.salary && (job.salary.includes('3,') || job.salary.includes('4,')));
  };

  const isJobUrgent = (job) => {
    return job.title.toLowerCase().includes('react') ||
           job.title.toLowerCase().includes('devops') ||
           (job.postedDate && new Date(job.postedDate) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
  };

  // Type translation mapper
  const formatJobType = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'Toàn thời gian';
      case 'PART_TIME': return 'Bán thời gian';
      case 'REMOTE': return 'Làm việc từ xa';
      case 'FREELANCE': return 'Tự do';
      default: return type || 'Chưa xác định';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'REMOTE': return 'badge-remote';
      case 'FREELANCE': return 'badge-hybrid';
      default: return 'badge-fulltime';
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

  // Client side job type filter
  const filteredJobs = jobTypeFilter 
    ? jobs.filter(j => j.jobType === jobTypeFilter)
    : jobs;

  return (
    <div className="jobs-page">
      {/* Toast popup */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="jobs-header">
        <BackButton to="/" label="Home" />
        <div className="jobs-header-text">
          <h1>Browse IT Jobs</h1>
          <p>Tìm kiếm và khám phá cơ hội từ các nhà tuyển dụng công nghệ hàng đầu</p>
        </div>
      </div>

      {/* Filter panel */}
      <form className="jobs-filters" onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          placeholder="Nhập tiêu đề, kỹ năng, hoặc tên công ty..." 
          className="jobs-search" 
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <select 
          className="jobs-select"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
        >
          <option value="">Tất cả Địa điểm</option>
          <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
          <option value="Remote">Làm việc từ xa</option>
        </select>
        <select 
          className="jobs-select"
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
        >
          <option value="">Tất cả Hình thức</option>
          <option value="FULL_TIME">Toàn thời gian</option>
          <option value="PART_TIME">Bán thời gian</option>
          <option value="REMOTE">Làm việc từ xa</option>
          <option value="FREELANCE">Tự do</option>
        </select>
        <button type="submit" className="search-submit-btn">Tìm kiếm</button>
      </form>

      {/* Job list render */}
      {loading ? (
        <div className="jobs-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu việc làm...</p>
        </div>
      ) : error ? (
        <div className="jobs-error">
          <p>{error}</p>
          <button onClick={fetchJobs} className="retry-btn">Thử lại</button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="jobs-empty">
          <span className="empty-icon">📂</span>
          <h3>Chưa có công việc nào</h3>
          <p>Không tìm thấy công việc phù hợp với bộ lọc hiện tại của bạn.</p>
        </div>
      ) : (
        <>
          <div className="jobs-list">
            {filteredJobs.map((job) => {
              const featured = isJobFeatured(job);
              const urgent = isJobUrgent(job);
              return (
                <div className={`job-card-item ${featured ? 'featured' : ''}`} key={job.jobId}>
                  <div className="job-card-header">
                    <div className="company-logo-small">
                      {job.logoUrl ? (
                        <img src={job.logoUrl} alt={job.companyName} />
                      ) : (
                        <div className="company-logo-placeholder-small">
                          {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                    </div>
                    <div className="job-title-block">
                      <Link to={`/jobs/${job.jobId}`} className="job-title-link">
                        <h3>{job.title}</h3>
                      </Link>
                      <p className="job-company-name-small">{job.companyName}</p>
                    </div>

                    <button 
                      className={`job-card-save-btn ${job.isSaved ? 'active' : ''}`}
                      onClick={(e) => handleSaveToggle(job.jobId, e)}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>

                  <div className="job-card-details">
                    <span className="job-detail-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {job.location || 'Hà Nội'}
                    </span>
                    <span className="job-detail-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      {job.salary || 'Thỏa thuận'}
                    </span>
                  </div>

                  <div className="job-card-badges">
                    <span className={`job-type-badge ${getTypeBadgeClass(job.jobType)}`}>
                      {formatJobType(job.jobType)}
                    </span>
                    {featured && <span className="badge badge-featured">Nổi bật</span>}
                    {urgent && <span className="badge badge-urgent">Tuyển gấp</span>}
                  </div>

                  <div className="job-card-footer">
                    <span className="job-card-posted">Đăng {formatDate(job.postedDate)}</span>
                    <Link to={`/jobs/${job.jobId}`} className="job-view-detail-btn">Xem chi tiết</Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                disabled={page === 0}
                className="page-nav-btn"
              >
                Trang trước
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index)}
                    className={`page-num-btn ${page === index ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={page === totalPages - 1}
                className="page-nav-btn"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobsPage;
