import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE'
  });

  const callbackRef = useRef();

  const handleGoogleLoginCallback = async (response) => {
    const idToken = response.credential;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      const res = await axios.post(`${apiBaseUrl}/auth/google`, {
        idToken: idToken,
        role: formData.role
      });

      setSuccessMsg(res.data.message || 'Đăng nhập bằng Google thành công!');

      // Decode Google ID Token to extract profile details
      let googleName = '';
      let googlePicture = '';
      try {
        const decoded = parseJwt(idToken);
        googleName = decoded?.name || '';
        googlePicture = decoded?.picture || '';
      } catch (err) {
        console.error("Lỗi parse JWT:", err);
      }

      if (res.data?.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.data.accessToken);
        localStorage.setItem('token', res.data.data.accessToken);
      }
      if (res.data?.data) {
        localStorage.setItem('user', JSON.stringify({
          userId: res.data.data.userId,
          email: res.data.data.email,
          role: res.data.data.role,
          accountStatus: res.data.data.accountStatus,
          fullName: res.data.data.fullName || googleName,
          avatarUrl: googlePicture
        }));
      }

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      setErrorMsg(err.response?.data?.message || 'Đăng nhập Google thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callbackRef.current = handleGoogleLoginCallback;
  });

  useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '422027726676-vg5gu561j1dv1hu19e52f9d12ktmrhs0.apps.googleusercontent.com',
          callback: (res) => callbackRef.current(res),
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: '320',
            text: isLogin ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
          }
        );
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      script.addEventListener('load', initializeGoogle);
    }

    return () => {
      script.removeEventListener('load', initializeGoogle);
    };
  }, [isLogin]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const accountStatus = urlParams.get('accountStatus');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role, accountStatus }));
      
      setSuccessMsg('Đăng nhập bằng Google thành công!');
      // Xóa query params trên URL để giao diện đẹp hơn
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } else if (error) {
      setErrorMsg(decodeURIComponent(error));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '', role: 'CANDIDATE' });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      if (isLogin) {
        const response = await axios.post(`${apiBaseUrl}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        setSuccessMsg(response.data.message || 'Đăng nhập thành công!');
        // Lưu token vào localStorage
        if (response.data?.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
          localStorage.setItem('token', response.data.data.accessToken);
        }
        if (response.data?.data) {
          localStorage.setItem('user', JSON.stringify({
            userId: response.data.data.userId,
            email: response.data.data.email,
            role: response.data.data.role,
            accountStatus: response.data.data.accountStatus
          }));
        }
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Mật khẩu xác nhận không khớp!");
          setLoading(false);
          return;
        }
        const response = await axios.post(`${apiBaseUrl}/auth/register`, {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        setSuccessMsg(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
        toggleMode();
      }
    } catch (err) {
      console.error("Lỗi gọi API:", err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="visual-content">
            <img src="logo.png" alt="Logo ITJobHub" />
            <p>{isLogin ? 'Chào mừng quay trở lại! Tìm công việc IT mơ ước của bạn ngay hôm nay.' : (formData.role === 'EMPLOYER' ? 'Tuyển dụng nhân tài IT hàng đầu cho doanh nghiệp của bạn dễ dàng hơn bao giờ hết.' : 'Tham gia cộng đồng IT lớn nhất và đẩy nhanh sự nghiệp của bạn.')}</p>
          </div>
          <div className="visual-overlay"></div>
        </div>

        <div className="auth-form-container">
          <div className="form-header">
            <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
            <p>
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button type="button" className="toggle-btn" onClick={toggleMode}>
                {isLogin ? 'Đăng ký' : 'Đăng nhập'}
              </button>
            </p>
          </div>

          {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}
          {successMsg && <div className="success-message" style={{ color: 'green', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="role-selector">
                <p>Bạn là:</p>
                <div className="role-options">
                  <label className={`role-option ${formData.role === 'CANDIDATE' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="CANDIDATE"
                      checked={formData.role === 'CANDIDATE'}
                      onChange={handleChange}
                    />
                    <span>Ứng viên</span>
                  </label>
                  <label className={`role-option ${formData.role === 'EMPLOYER' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="EMPLOYER"
                      checked={formData.role === 'EMPLOYER'}
                      onChange={handleChange}
                    />
                    <span>Nhà tuyển dụng</span>
                  </label>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="fullName">{formData.role === 'EMPLOYER' ? 'Tên doanh nghiệp / Người đại diện' : 'Họ và tên'}</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder={formData.role === 'EMPLOYER' ? 'Công ty TNHH ABC' : 'Nguyễn Văn A'}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Địa chỉ Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={formData.role === 'EMPLOYER' ? 'Nhập địa chỉ email của bạn' : 'Nhập địa chỉ email công ty'}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <a href="#">Quên mật khẩu?</a>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>

            <div className="divider">
              <span>HOẶC</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div id="googleSignInButton"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
