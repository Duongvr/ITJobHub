import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import './JobsPage.css';

const JobsPage = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechVN Corp',
      location: 'Ho Chi Minh City',
      salary: '$2,000 - $3,500',
      type: 'Full-time',
      tags: ['React', 'TypeScript', 'Node.js'],
      posted: '2 days ago',
    },
    {
      id: 2,
      title: 'Backend Engineer (Java)',
      company: 'FPT Software',
      location: 'Ha Noi',
      salary: '$1,500 - $2,800',
      type: 'Full-time',
      tags: ['Java', 'Spring Boot', 'AWS'],
      posted: '5 days ago',
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'VNG Corporation',
      location: 'Remote',
      salary: '$2,500 - $4,000',
      type: 'Remote',
      tags: ['Docker', 'K8s', 'CI/CD'],
      posted: '1 day ago',
    },
    {
      id: 4,
      title: 'Mobile Developer (Flutter)',
      company: 'Zalo',
      location: 'Ho Chi Minh City',
      salary: '$1,800 - $3,000',
      type: 'Full-time',
      tags: ['Flutter', 'Dart', 'Firebase'],
      posted: '3 days ago',
    },
    {
      id: 5,
      title: 'Data Scientist',
      company: 'Momo',
      location: 'Ha Noi',
      salary: '$2,200 - $3,800',
      type: 'Hybrid',
      tags: ['Python', 'TensorFlow', 'SQL'],
      posted: '6 hours ago',
    },
    {
      id: 6,
      title: 'UI/UX Designer',
      company: 'Tiki',
      location: 'Ho Chi Minh City',
      salary: '$1,200 - $2,000',
      type: 'Full-time',
      tags: ['Figma', 'Design System', 'Prototyping'],
      posted: '4 days ago',
    },
  ];

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Remote': return 'badge-remote';
      case 'Hybrid': return 'badge-hybrid';
      default: return 'badge-fulltime';
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <BackButton to="/" label="Home" />
        <div className="jobs-header-text">
          <h1>Browse IT Jobs</h1>
          <p>Discover {jobs.length} opportunities from top tech companies</p>
        </div>
      </div>

      <div className="jobs-filters">
        <input type="text" placeholder="Search by title, skill or company..." className="jobs-search" />
        <select className="jobs-select">
          <option value="">All Locations</option>
          <option value="hcm">Ho Chi Minh City</option>
          <option value="hn">Ha Noi</option>
          <option value="remote">Remote</option>
        </select>
        <select className="jobs-select">
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="jobs-list">
        {jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <div className="job-card-top">
              <div className="job-info">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
              </div>
              <span className={`job-type-badge ${getTypeBadgeClass(job.type)}`}>{job.type}</span>
            </div>
            <div className="job-meta">
              <span className="job-location">📍 {job.location}</span>
              <span className="job-salary">💰 {job.salary}</span>
            </div>
            <div className="job-tags">
              {job.tags.map((tag, i) => (
                <span className="job-tag" key={i}>{tag}</span>
              ))}
            </div>
            <div className="job-card-bottom">
              <span className="job-posted">{job.posted}</span>
              <Link to="/auth" className="job-apply-btn">Apply Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;
