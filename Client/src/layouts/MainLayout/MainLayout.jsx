import React, { useState } from 'react';
import './MainLayout.css';
import { Outlet, Link, NavLink } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
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
                    backgroundColor: user.avatarUrl ? 'transparent' : '#0056b3',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                  }}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.fullName || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>Hồ sơ của tôi</Link>
                    <button onClick={handleLogoutClick} className="logout-btn">Đăng xuất</button>
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

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default MainLayout;
