import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Auth.css';

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

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:9999/api/v1/auth/login', {
          email: formData.email,
          password: formData.password
        });
        setSuccessMsg(response.data.message || 'Đăng nhập thành công!');
        navigate("/");
        console.log('Login response:', response.data);
        // Lưu token vào localStorage
        if (response.data?.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Mật khẩu xác nhận không khớp!");
          setLoading(false);
          return;
        }
        const response = await axios.post('http://localhost:9999/api/v1/auth/register', {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        setSuccessMsg(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
        navigate("/login");
        console.log('Register response:', response.data);
      }
    } catch (err) {
      console.error("Lỗi gọi API:", err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await axios.post('http://localhost:9999/api/v1/auth/google', {
        idToken: credentialResponse.credential,
        role: formData.role // Vai trò mong muốn nếu là lần đầu đăng nhập/đăng ký bằng Google
      });
      setSuccessMsg(response.data.message || 'Đăng nhập Google thành công!');
      if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      navigate("/");
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập bằng Google.');
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Đăng nhập Google thất bại');
                  setErrorMsg('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                }}
                text={isLogin ? "signin_with" : "signup_with"}
                width="320"
                theme="outline"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
