package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;

    private String phone;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    // Số lần gửi lại OTP trong ngày (dùng để giới hạn spam - không có cột riêng
    // trong DB hiện tại nên lưu tạm ở bộ đếm in-memory trong OtpService,
    // hoặc thêm cột otp_resend_count + otp_resend_date nếu muốn lưu DB)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (userId == null) userId = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AuthProvider { LOCAL, GOOGLE, FACEBOOK }
    public enum Role { CANDIDATE, EMPLOYER, ADMIN }
    public enum AccountStatus { PENDING_VERIFICATION, ACTIVE, LOCKED, DELETED }
}
