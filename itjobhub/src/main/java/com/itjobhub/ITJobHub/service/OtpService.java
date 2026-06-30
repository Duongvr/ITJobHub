package com.itjobhub.ITJobHub.service;

import com.itjobhub.ITJobHub.entity.User;
import com.itjobhub.ITJobHub.exception.AppException;
import com.itjobhub.ITJobHub.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Quản lý sinh, lưu, kiểm tra mã OTP.
 * - OTP 6 chữ số, hết hạn sau 5 phút (theo đặc tả mục UC_03).
 * - Giới hạn gửi lại tối đa 3 lần / ngày / email, đếm bằng bộ đếm in-memory.
 */
@Service
@Slf4j
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_RESEND_PER_DAY = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final MailService mailService;

    // In-memory counter cho giới hạn resend OTP
    private final ConcurrentHashMap<String, AtomicInteger> resendCountMap = new ConcurrentHashMap<>();

    public OtpService(UserRepository userRepository, MailService mailService) {
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    public String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }

    /** Sinh OTP mới, lưu vào user, gửi email. Dùng cho luồng đăng ký & quên mật khẩu. */
    public void createAndSendOtp(User user, OtpPurpose purpose) {
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);

        String subject = switch (purpose) {
            case REGISTER -> "Xác thực tài khoản ITJobHub";
            case RESET_PASSWORD -> "Khôi phục mật khẩu ITJobHub";
        };
        String content = "Mã xác thực (OTP) của bạn là: " + otp +
                ". Mã có hiệu lực trong " + OTP_EXPIRY_MINUTES + " phút. " +
                "Vui lòng không chia sẻ mã này cho bất kỳ ai.";

        mailService.sendOtpEmail(user.getEmail(), subject, content);
    }

    /** Kiểm tra & tăng bộ đếm resend trong ngày, ném lỗi nếu vượt giới hạn. */
    public void checkResendLimit(String email) {
        AtomicInteger counter = resendCountMap.computeIfAbsent(email, k -> new AtomicInteger(0));
        int count = counter.incrementAndGet();
        if (count > MAX_RESEND_PER_DAY) {
            throw new AppException(
                    "Bạn đã đạt giới hạn gửi lại mã (" + MAX_RESEND_PER_DAY + " lần/ngày). Vui lòng thử lại sau.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    public void verifyOtp(User user, String inputOtp) {
        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            throw new AppException("Tài khoản chưa có mã OTP nào được tạo.", HttpStatus.BAD_REQUEST);
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new AppException("Mã xác nhận đã hết hạn.", HttpStatus.BAD_REQUEST);
        }
        if (!user.getOtpCode().equals(inputOtp)) {
            throw new AppException("Mã xác nhận không đúng.", HttpStatus.BAD_REQUEST);
        }
        // Vô hiệu hóa OTP sau khi dùng thành công (chống dùng lại)
        user.setOtpCode(null);
        user.setOtpExpiry(null);
    }

    public enum OtpPurpose { REGISTER, RESET_PASSWORD }
}
