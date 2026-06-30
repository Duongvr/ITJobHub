import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const featuredCategories = [
    { icon: '💻', title: 'Frontend Developer', count: 1240 },
    { icon: '⚙️', title: 'Backend Developer', count: 980 },
    { icon: '📱', title: 'Mobile Developer', count: 650 },
    { icon: '☁️', title: 'DevOps Engineer', count: 430 },
    { icon: '🛡️', title: 'Cybersecurity', count: 320 },
    { icon: '📊', title: 'Data Engineer', count: 560 },
  ];

  const stats = [
    { value: '12,000+', label: 'Jobs Posted' },
    { value: '5,000+', label: 'Companies' },
    { value: '50,000+', label: 'IT Professionals' },
    { value: '98%', label: 'Satisfaction' },
  ];

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
              <input type="text" placeholder="Job title, keyword or company..." className="search-input" />
            </div>
            <Link to="/jobs" className="search-btn">Search Jobs</Link>
          </div>
          <div className="hero-tags">
            <span>Popular:</span>
            <Link to="/jobs">React</Link>
            <Link to="/jobs">Python</Link>
            <Link to="/jobs">DevOps</Link>
            <Link to="/jobs">AI/ML</Link>
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
          {featuredCategories.map((cat, index) => (
            <Link to="/jobs" className="category-card" key={index}>
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
