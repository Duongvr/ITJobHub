package com.itjobhub.ITJobHub.controller;

import com.itjobhub.ITJobHub.dto.*;
import com.itjobhub.ITJobHub.dto.auth.*;
import com.itjobhub.ITJobHub.service.AuthService;
import com.itjobhub.ITJobHub.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Các endpoint khớp với mục 3.3 "Danh sách API Endpoints" trong tài liệu đặc tả:
 * POST /api/v1/auth/login
 * POST /api/v1/auth/register
 * POST /api/v1/auth/forgot-password
 * POST /api/v1/auth/reset-password
 * (+ bổ sung các endpoint OTP & Google cần thiết cho luồng UC_03 / UC_05)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực OTP."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyRegisterOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("Xác thực tài khoản thành công.", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request, OtpService.OtpPurpose.REGISTER);
        return ResponseEntity.ok(ApiResponse.ok("Mã xác thực mới đã được gửi tới email của bạn."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công.", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@Valid @RequestBody ApiResponse.GoogleLoginRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập bằng Google thành công.", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Mã OTP khôi phục mật khẩu đã được gửi tới email của bạn."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }
}
