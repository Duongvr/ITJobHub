package com.itjobhub.ITJobHub.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.itjobhub.ITJobHub.dto.*;
import com.itjobhub.ITJobHub.entity.User;
import com.itjobhub.ITJobHub.exception.AppException;
import com.itjobhub.ITJobHub.repository.UserRepository;
import com.itjobhub.ITJobHub.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final GoogleTokenVerifier googleTokenVerifier;

    // ====================== ĐĂNG KÝ (UC_03) ======================

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã tồn tại trong hệ thống.", HttpStatus.CONFLICT);
        }
        if (request.getRole() == User.Role.ADMIN) {
            throw new AppException("Không thể tự đăng ký tài khoản ADMIN.", HttpStatus.FORBIDDEN);
        }

        User user = User.builder()
                .userId(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .authProvider(User.AuthProvider.LOCAL)
                .accountStatus(User.AccountStatus.PENDING_VERIFICATION)
                .build();

        // fullName được lưu ở bảng candidates/companies (tuỳ role) - xử lý ở
        // CandidateService/CompanyService sau khi tài khoản được ACTIVE,
        // hoặc tạo bản ghi rỗng song song tại đây nếu nghiệp vụ yêu cầu.

        userRepository.save(user);
        otpService.createAndSendOtp(user, OtpService.OtpPurpose.REGISTER);
    }

    @Transactional
    public AuthResponse verifyRegisterOtp(VerifyOtpRequest request) {
        User user = getUserOrThrow(request.getEmail());

        if (user.getAccountStatus() == User.AccountStatus.ACTIVE) {
            throw new AppException("Tài khoản đã được xác thực trước đó.", HttpStatus.BAD_REQUEST);
        }

        otpService.verifyOtp(user, request.getOtpCode());
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public void resendOtp(ResendOtpRequest request, OtpService.OtpPurpose purpose) {
        User user = getUserOrThrow(request.getEmail());
        otpService.checkResendLimit(request.getEmail());
        otpService.createAndSendOtp(user, purpose);
    }

    // ====================== ĐĂNG NHẬP (UC_05) ======================

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("Email hoặc mật khẩu không đúng.", HttpStatus.UNAUTHORIZED));

        if (user.getAuthProvider() != User.AuthProvider.LOCAL) {
            throw new AppException(
                    "Tài khoản này được đăng ký qua " + user.getAuthProvider() +
                            ". Vui lòng đăng nhập bằng " + user.getAuthProvider() + ".",
                    HttpStatus.BAD_REQUEST);
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Email hoặc mật khẩu không đúng.", HttpStatus.UNAUTHORIZED);
        }

        validateAccountStatusForLogin(user);

        return buildAuthResponse(user);
    }

    // ====================== ĐĂNG NHẬP / ĐĂNG KÝ GOOGLE ======================

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        String email = payload.getEmail();
        String googleId = payload.getSubject();
        Boolean emailVerified = payload.getEmailVerified();

        if (emailVerified == null || !emailVerified) {
            throw new AppException("Email Google chưa được xác thực.", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Đăng ký nhanh qua Google (UC_03 - luồng thay thế)
            User.Role role = parseRoleOrDefault(request.getRole());
            user = User.builder()
                    .userId(UUID.randomUUID().toString())
                    .email(email)
                    .password(null) // không có mật khẩu cục bộ
                    .role(role)
                    .authProvider(User.AuthProvider.GOOGLE)
                    .providerId(googleId)
                    .accountStatus(User.AccountStatus.ACTIVE) // OAuth -> xác thực ngay, theo đặc tả
                    .build();
            userRepository.save(user);
        } else {
            if (user.getAuthProvider() == User.AuthProvider.LOCAL) {
                // Email đã có tài khoản LOCAL -> liên kết tài khoản Google vào cùng user
                user.setProviderId(googleId);
            }
            validateAccountStatusForLogin(user);
        }

        return buildAuthResponse(user);
    }

    // ====================== QUÊN / ĐẶT LẠI MẬT KHẨU ======================

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = getUserOrThrow(request.getEmail());
        otpService.checkResendLimit(request.getEmail());
        otpService.createAndSendOtp(user, OtpService.OtpPurpose.RESET_PASSWORD);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = getUserOrThrow(request.getEmail());
        otpService.verifyOtp(user, request.getOtpCode());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ====================== HELPERS ======================

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản với email này.", HttpStatus.NOT_FOUND));
    }

    private void validateAccountStatusForLogin(User user) {
        switch (user.getAccountStatus()) {
            case PENDING_VERIFICATION -> throw new AppException(
                    "Tài khoản chưa được xác thực. Vui lòng nhập mã OTP hoặc yêu cầu gửi lại mã.",
                    HttpStatus.FORBIDDEN);
            case LOCKED -> throw new AppException(
                    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", HttpStatus.FORBIDDEN);
            case DELETED -> throw new AppException(
                    "Tài khoản này đã bị xóa.", HttpStatus.FORBIDDEN);
            case ACTIVE -> { /* ok */ }
        }
    }

    private User.Role parseRoleOrDefault(String role) {
        try {
            return role == null ? User.Role.CANDIDATE : User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return User.Role.CANDIDATE;
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountStatus(user.getAccountStatus().name())
                .build();
    }
}
