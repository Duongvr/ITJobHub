import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [popularTags, setPopularTags] = useState(['React', 'Python', 'DevOps', 'AI']);

  const [stats, setStats] = useState([
    { value: '0', label: 'Jobs Posted' },
    { value: '0', label: 'Companies' },
    { value: '500+', label: 'IT Professionals' },
    { value: '98%', label: 'Satisfaction' },
  ]);

  const [categories, setCategories] = useState([
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      title: 'Frontend Developer',
      count: 0,
      query: 'Frontend'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
        </svg>
      ),
      title: 'Backend Developer',
      count: 0,
      query: 'Backend'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
      title: 'Mobile Developer',
      count: 0,
      query: 'Mobile'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
      ),
      title: 'DevOps Engineer',
      count: 0,
      query: 'DevOps'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Cybersecurity',
      count: 0,
      query: 'Security'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      title: 'Data Engineer',
      count: 0,
      query: 'Data'
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/jobs', { params: { page: 0, size: 1000 } });
        if (response.data && response.data.data) {
          const allJobs = response.data.data.content || [];
          const totalJobs = response.data.data.totalElements || allJobs.length;

          // Unique companies set
          const uniqueCompanyIds = new Set(allJobs.map(j => j.companyId).filter(Boolean));
          const totalCompanies = uniqueCompanyIds.size;

          setStats([
            { value: `${totalJobs}`, label: 'Jobs Posted' },
            { value: `${totalCompanies}`, label: 'Companies' },
            { value: `${Math.max(totalJobs * 3 + 15, 120)}+`, label: 'IT Professionals' },
            { value: '98%', label: 'Satisfaction' },
          ]);

          setCategories(prev => prev.map(cat => {
            let count = 0;
            if (cat.query === 'Frontend') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('angular') || t.includes('html') || t.includes('css') || t.includes('javascript') || t.includes('js');
              }).length;
            } else if (cat.query === 'Backend') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('backend') || t.includes('java') || t.includes('spring') || t.includes('node') || t.includes('python') || t.includes('go') || t.includes('golang') || t.includes('c#') || t.includes('.net') || t.includes('php');
              }).length;
            } else if (cat.query === 'Mobile') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('mobile') || t.includes('android') || t.includes('ios') || t.includes('flutter') || t.includes('kotlin') || t.includes('swift') || t.includes('react native');
              }).length;
            } else if (cat.query === 'DevOps') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('devops') || t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('docker') || t.includes('kubernetes') || t.includes('ci/cd') || t.includes('system admin');
              }).length;
            } else if (cat.query === 'Security') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('security') || t.includes('cyber') || t.includes('infosec') || t.includes('pentest') || t.includes('hacker');
              }).length;
            } else if (cat.query === 'Data') {
              count = allJobs.filter(j => {
                const t = (j.title || '').toLowerCase();
                return t.includes('data') || t.includes('analytics') || t.includes('bi') || t.includes('machine learning') || t.includes('ai') || t.includes('sql');
              }).length;
            }
            return { ...cat, count };
          }));

          // Calculate popular tags dynamically based on job titles frequency
          const tagCandidates = ['React', 'Python', 'Java', 'DevOps', 'Node', 'AI', 'Flutter', 'Spring', 'Javascript', 'Golang', 'PHP', 'Docker'];
          const tagCounts = tagCandidates.map(tag => {
            const count = allJobs.filter(j => {
              const title = (j.title || '').toLowerCase();
              const desc = (j.description || '').toLowerCase();
              const searchStr = tag.toLowerCase();
              return title.includes(searchStr) || desc.includes(searchStr);
            }).length;
            return { tag, count };
          });

          const sortedTags = tagCounts
            .filter(tc => tc.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(tc => tc.tag);

          if (sortedTags.length >= 3) {
            setPopularTags(sortedTags.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching statistics from backend:', err);
      }
    };

    fetchStats();
  }, []);

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Top IT Job Platform in Vietnam</span>
          <h1 className="hero-title">
            Find Your <span className="highlight">Dream IT Job</span> Today
          </h1>
          <p className="hero-subtitle">
            Kết nối với các công ty công nghệ hàng đầu và khám phá những cơ hội phù hợp với kỹ năng, đam mê và mục tiêu nghề nghiệp của bạn.
          </p>
          <div className="hero-search">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword or company..."
                className="search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button onClick={handleSearch} className="search-btn" style={{ border: 'none', cursor: 'pointer' }}>Search Jobs</button>
          </div>
          <div className="hero-tags">
            <span>Popular:</span>
            {popularTags.map((tag, idx) => (
              <Link key={idx} to={`/jobs?keyword=${encodeURIComponent(tag)}`}>{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Browse by Category</h2>
          <p>Explore top IT job categories and find the perfect match</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <Link to={`/jobs?keyword=${encodeURIComponent(cat.query)}`} className="category-card" key={index}>
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.title}</h3>
              <span className="category-count">{cat.count.toLocaleString()} jobs</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Take the Next Step?</h2>
          <p>Create your free account today and get matched with opportunities from the best tech companies.</p>
          <Link to="/auth" className="cta-btn">Get Started Free →</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
