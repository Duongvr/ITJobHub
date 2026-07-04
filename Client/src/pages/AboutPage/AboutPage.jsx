import React from 'react';
import BackButton from '../../components/BackButton/BackButton';
import './AboutPage.css';

const AboutPage = () => {
  const team = [
    { emoji: '👨‍💻', name: 'Đoàn Đức Dương', role: 'System Design' },
    { emoji: '👩‍💼', name: 'Tran Thi B', role: 'Backend Developer' },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About <span className="highlight">ITJobHub</span></h1>
        <p>
          We're on a mission to bridge the gap between talented IT professionals and innovative companies across Vietnam and Southeast Asia.
        </p>
      </section>

      <section className="about-values">
        <div className="value-card">
          <span className="value-icon">🎯</span>
          <h3>Our Mission</h3>
          <p>To connect every IT professional with their ideal career opportunity, making job searching efficient and enjoyable.</p>
        </div>
        <div className="value-card">
          <span className="value-icon">👁️</span>
          <h3>Our Vision</h3>
          <p>To become the leading technology recruitment platform in Southeast Asia by 2028.</p>
        </div>
        <div className="value-card">
          <span className="value-icon">💡</span>
          <h3>Our Values</h3>
          <p>Transparency, innovation, and putting people first in everything we do.</p>
        </div>
      </section>

      <section className="about-team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {team.map((member, i) => (
            <div className="team-card" key={i}>
              <span className="team-avatar">{member.emoji}</span>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
