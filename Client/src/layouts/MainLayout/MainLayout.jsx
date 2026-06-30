import React, { useState } from 'react';
import './MainLayout.css';
import { Outlet, Link, NavLink } from 'react-router-dom';

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Bạn có muốn đăng xuất không?')) {
      localStorage.removeItem('accessToken');
      window.location.reload();
    }
  };

  return (
    <div className="main-layout">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <Link to="/">
              <span className="brand-logo">💼</span>
              <span className="brand-text">ITJobHub</span>
            </Link>
          </div>

          {/* Hamburger button for mobile */}
          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`navbar-nav ${menuOpen ? 'show' : ''}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/jobs" onClick={() => setMenuOpen(false)}>Việc làm</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>Giới thiệu</NavLink>
            {localStorage.getItem('accessToken') ? (
              <div className="user-menu-container" style={{ position: 'relative', marginLeft: '15px' }}>
                <div 
                  className="user-avatar" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#0056b3',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  U
                </div>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>Hồ sơ của tôi</Link>
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="nav-btn-login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-logo">💼</span>
            <span className="brand-text">ITJobHub</span>
          </div>
          <nav className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/jobs">Jobs</Link>
            <a href="mailto:contact@itjobhub.vn">Contact</a>
          </nav>
          <p className="footer-copy">&copy; {new Date().getFullYear()} ITJobHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
