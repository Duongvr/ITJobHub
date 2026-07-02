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
  const [isOtpVerification, setIsOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [hasSentOtpOnce, setHasSentOtpOnce] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE'
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('EMAIL'); // 'EMAIL' | 'RESET'
  const [forgotEmail, setForgotPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [touchedFields, setTouchedFields] = useState({
    email: false,
    confirmPassword: false
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    confirmPassword: ''
  });

  // Reset OTP states when registration email or forgot email changes (so user can click OTP send button again)
  useEffect(() => {
    setHasSentOtpOnce(false);
    setCountdown(0);
    setOtpCode('');
  }, [formData?.email, forgotEmail]);

  // Validation useEffect for email format and confirm password matching
  useEffect(() => {
    const errors = { email: '', confirmPassword: '' };

    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email không đúng định dạng (VD: example@domain.com)';
      }
    }

    // Confirm Password validation
    if (!isLogin) {
      if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
      }
    }

    setValidationErrors(errors);
  }, [formData.email, formData.password, formData.confirmPassword, isLogin]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/verify-otp`, {
        email: otpEmail,
        otpCode: otpCode
      });

      setSuccessMsg(response.data.message || 'Xác thực tài khoản thành công!');

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
    } catch (err) {
      console.error("Lỗi xác thực OTP:", err);
      setErrorMsg(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/resend-otp`, {
        email: otpEmail
      });
      setSuccessMsg(response.data.message || 'Gửi lại mã OTP thành công!');
      setHasSentOtpOnce(true);
      setCountdown(60);
    } catch (err) {
      console.error("Lỗi gửi lại OTP:", err);
      setErrorMsg(err.response?.data?.message || 'Không thể gửi lại mã OTP, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRegisterOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg(formData.role === 'EMPLOYER' ? 'Vui lòng nhập tên doanh nghiệp!' : 'Vui lòng nhập họ và tên!');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email!');
      return;
    }
    if (validationErrors.email) {
      setErrorMsg(validationErrors.email);
      return;
    }
    if (!formData.password) {
      setErrorMsg('Vui lòng nhập mật khẩu!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setSuccessMsg(response.data.message || 'Mã OTP đã được gửi đến email của bạn.');
      setOtpEmail(formData.email);
      setHasSentOtpOnce(true);
      setCountdown(60);
    } catch (err) {
      console.error("Lỗi khi gửi OTP đăng ký:", err);
      if (err.response?.status === 409 || err.response?.data?.message?.includes("tồn tại")) {
        try {
          const resendResponse = await axios.post(`${apiBaseUrl}/auth/resend-otp`, {
            email: formData.email
          });
          setSuccessMsg(resendResponse.data.message || 'Mã OTP mới đã được gửi đến email của bạn.');
          setOtpEmail(formData.email);
          setHasSentOtpOnce(true);
          setCountdown(60);
        } catch (resendErr) {
          console.error("Lỗi gửi lại OTP:", resendErr);
          setErrorMsg(resendErr.response?.data?.message || 'Email này đã được sử dụng hoặc không hợp lệ.');
        }
      } else {
        setErrorMsg(err.response?.data?.message || 'Không thể gửi mã OTP, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      if (forgotPasswordStep === 'EMAIL') {
        if (!forgotEmail.trim()) {
          setErrorMsg('Vui lòng nhập địa chỉ email!');
          setLoading(false);
          return;
        }
        await axios.post(`${apiBaseUrl}/auth/forgot-password`, {
          email: forgotEmail
        });
        setSuccessMsg('Mã OTP khôi phục mật khẩu đã được gửi tới email của bạn.');
        setForgotPasswordStep('RESET');
        setOtpCode('');
        setCountdown(60);
      } else {
        if (!otpCode || otpCode.length < 6) {
          setErrorMsg('Vui lòng nhập đầy đủ mã OTP 6 chữ số!');
          setLoading(false);
          return;
        }
        if (!newPassword || newPassword.length < 6) {
          setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setErrorMsg('Mật khẩu mới xác nhận không khớp!');
          setLoading(false);
          return;
        }

        await axios.post(`${apiBaseUrl}/auth/reset-password`, {
          email: forgotEmail,
          otpCode: otpCode,
          newPassword: newPassword
        });

        setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setForgotPasswordStep('EMAIL');
          setFormData(prev => ({ ...prev, email: forgotEmail, password: '' }));
          setErrorMsg('');
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      console.error("Lỗi khôi phục mật khẩu:", err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotPasswordOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';

    try {
      await axios.post(`${apiBaseUrl}/auth/forgot-password`, {
        email: forgotEmail
      });
      setSuccessMsg('Mã OTP mới đã được gửi tới email của bạn.');
      setCountdown(60);
    } catch (err) {
      console.error("Lỗi gửi lại OTP khôi phục mật khẩu:", err);
      setErrorMsg(err.response?.data?.message || 'Không thể gửi lại mã OTP, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };



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
    setOtpCode('');
    setHasSentOtpOnce(false);
    setCountdown(0);
    setAcceptTerms(false);
    setIsForgotPassword(false);
    setForgotPasswordStep('EMAIL');
    setForgotPasswordEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTouchedFields({ email: false, confirmPassword: false });
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
        if (validationErrors.email) {
          setErrorMsg(validationErrors.email);
          setLoading(false);
          return;
        }
        if (validationErrors.confirmPassword) {
          setErrorMsg(validationErrors.confirmPassword);
          setLoading(false);
          return;
        }
        if (!acceptTerms) {
          setErrorMsg("Bạn phải đồng ý với Điều khoản & Điều kiện để đăng ký!");
          setLoading(false);
          return;
        }
        if (!hasSentOtpOnce) {
          setErrorMsg("Vui lòng nhấn nút 'Nhận mã' để nhận mã OTP trước khi đăng ký!");
          setLoading(false);
          return;
        }
        if (!otpCode || otpCode.length < 6) {
          setErrorMsg("Vui lòng nhập đầy đủ mã OTP 6 chữ số!");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${apiBaseUrl}/auth/verify-otp`, {
          email: formData.email,
          otpCode: otpCode
        });

        setSuccessMsg(response.data.message || 'Đăng ký và xác thực tài khoản thành công!');

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
      }
    } catch (err) {
      console.error("Lỗi gọi API:", err);
      const isPendingVerification =
        err.response?.status === 403 &&
        (err.response?.data?.message?.includes("chưa được xác thực") ||
          err.response?.data?.message?.includes("OTP"));

      if (isLogin && isPendingVerification) {
        setErrorMsg("Tài khoản chưa được kích hoạt. Hãy nhập mã OTP để tiếp tục.");
        setOtpEmail(formData.email);
        setIsOtpVerification(true);
        setOtpCode('');
        setHasSentOtpOnce(false);
        setCountdown(0);
      } else {
        setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
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
            <p>
              {isForgotPassword
                ? 'Khôi phục mật khẩu - Nhận mã OTP để tạo lại mật khẩu mới cho tài khoản của bạn.'
                : isOtpVerification
                  ? 'Xác thực OTP - Bước cuối cùng để kích hoạt tài khoản của bạn tại ITJobHub.'
                  : isLogin
                    ? 'Chào mừng quay trở lại! Tìm công việc IT mơ ước của bạn ngay hôm nay.'
                    : (formData.role === 'EMPLOYER'
                      ? 'Tuyển dụng nhân tài IT hàng đầu cho doanh nghiệp của bạn dễ dàng hơn bao giờ hết.'
                      : 'Tham gia cộng đồng IT lớn nhất và đẩy nhanh sự nghiệp của bạn.')
              }
            </p>
          </div>
          <div className="visual-overlay"></div>
        </div>

        <div className="auth-form-container">
          {isForgotPassword ? (
            <div className="forgot-password-container">
              <div className="form-header">
                <h2>Khôi phục mật khẩu</h2>
                <p>
                  {forgotPasswordStep === 'EMAIL'
                    ? 'Nhập email liên kết với tài khoản của bạn để nhận mã OTP khôi phục.'
                    : `Một mã OTP khôi phục đã được gửi tới ${forgotEmail}. Vui lòng kiểm tra email của bạn.`
                  }
                </p>
              </div>

              {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}
              {successMsg && <div className="success-message" style={{ color: 'green', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}

              <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
                {forgotPasswordStep === 'EMAIL' ? (
                  <div className="input-group">
                    <label htmlFor="forgotEmail">Địa chỉ Email</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      name="forgotEmail"
                      placeholder="email@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <label htmlFor="forgotOtp">Mã xác thực OTP</label>
                      <div className="otp-input-wrapper">
                        <input
                          type="text"
                          id="forgotOtp"
                          name="forgotOtp"
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}
                        />
                        <button
                          type="button"
                          className="otp-resend-btn"
                          onClick={handleResendForgotPasswordOtp}
                          disabled={loading || countdown > 0}
                        >
                          {countdown > 0
                            ? `Gửi lại mã (${countdown}s)`
                            : 'Gửi lại mã'}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="newPassword">Mật khẩu mới</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Đang xử lý...' : (forgotPasswordStep === 'EMAIL' ? 'Gửi mã khôi phục' : 'Đặt lại mật khẩu')}
                </button>

                <button
                  type="button"
                  className="back-to-auth-btn"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '1rem',
                    textAlign: 'center',
                    textDecoration: 'underline'
                  }}
                >
                  Quay lại đăng nhập
                </button>
              </form>
            </div>
          ) : isOtpVerification ? (
            <div className="otp-verification-container">
              <div className="form-header">
                <h2>Xác thực tài khoản</h2>
                <p>
                  Một mã OTP đã được gửi tới email <strong>{otpEmail}</strong>. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
                </p>
              </div>

              {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}
              {successMsg && <div className="success-message" style={{ color: 'green', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}

              <form className="auth-form" onSubmit={handleVerifyOtp}>
                <div className="input-group">
                  <label htmlFor="otpCode">Mã xác thực OTP</label>
                  <div className="otp-input-wrapper">
                    <input
                      type="text"
                      id="otpCode"
                      name="otpCode"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}
                    />
                    <button
                      type="button"
                      className="otp-resend-btn"
                      onClick={handleResendOtp}
                      disabled={loading || countdown > 0}
                    >
                      {countdown > 0
                        ? `Gửi lại mã (${countdown}s)`
                        : (hasSentOtpOnce ? 'Gửi lại mã' : 'Nhận mã')}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading || otpCode.length < 4}>
                  {loading ? 'Đang xác thực...' : 'Xác thực & Đăng nhập'}
                </button>

                <button
                  type="button"
                  className="back-to-auth-btn"
                  onClick={() => {
                    setIsOtpVerification(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '1rem',
                    textAlign: 'center',
                    textDecoration: 'underline'
                  }}
                >
                  Quay lại đăng ký / đăng nhập
                </button>
              </form>
            </div>
          ) : (
            <>
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
                    placeholder={formData.role === 'EMPLOYER' ? 'Nhập địa chỉ email công ty' : 'Nhập địa chỉ email của bạn'}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                    required
                  />
                  {touchedFields.email && validationErrors.email && (
                    <span className="validation-error">{validationErrors.email}</span>
                  )}
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
                  <>
                    <div className="input-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                        required
                      />
                      {touchedFields.confirmPassword && validationErrors.confirmPassword && (
                        <span className="validation-error">{validationErrors.confirmPassword}</span>
                      )}
                    </div>
                    <div className="input-group">
                      <label htmlFor="registerOtp">Mã xác thực OTP</label>
                      <div className="otp-input-wrapper">
                        <input
                          type="text"
                          id="registerOtp"
                          name="registerOtp"
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}
                        />
                        <button
                          type="button"
                          className="otp-resend-btn"
                          onClick={handleSendRegisterOtp}
                          disabled={loading || countdown > 0}
                        >
                          {countdown > 0
                            ? `Gửi lại mã (${countdown}s)`
                            : (hasSentOtpOnce ? 'Gửi lại mã' : 'Nhận mã')}
                        </button>
                      </div>
                    </div>
                    <div className="terms-checkbox-group">
                      <label className="terms-checkbox-label">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          required
                        />
                        <span>
                          Tôi đồng ý với <a href="#" onClick={(e) => e.preventDefault()}>Điều khoản & Điều kiện</a> sử dụng của ITJobHub
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="forgot-password">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                      setForgotPasswordStep('EMAIL');
                      setForgotPasswordEmail(formData.email || '');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setOtpCode('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}>Quên mật khẩu?</a>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
