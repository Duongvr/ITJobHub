package com.itjobhub.ITJobHub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Gửi email OTP. Khi dịch vụ mail bên thứ ba gặp sự cố (theo đặc tả UC_03 -
 * mục "Các ngoại lệ"), hệ thống KHÔNG rollback việc tạo tài khoản, chỉ log lỗi
 * và để FE hiển thị thông báo "Dịch vụ gửi mã đang tạm gián đoạn..." kèm nút
 * "Gửi lại mã xác nhận".
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (Exception e) {
            // Không throw để không làm hỏng luồng tạo tài khoản (đã ghi vào DB ở bước trước).
            log.error("Gửi email OTP tới {} thất bại: {}", toEmail, e.getMessage());
        }
    }
}
