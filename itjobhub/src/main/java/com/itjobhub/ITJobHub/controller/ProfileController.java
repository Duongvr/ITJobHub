package com.itjobhub.ITJobHub.controller;


import com.itjobhub.ITJobHub.dto.*;
import com.itjobhub.ITJobHub.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/v1/profile
     * Lấy thông tin profile của người dùng đang đăng nhập.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(ApiResponse.ok("Thông tin hồ sơ", profileService.getProfile(userId)));
    }

    /**
     * PUT /api/v1/profile/candidate
     * Cập nhật hồ sơ ứng viên (phone, fullName, bio, skills, ...).
     */
    @PutMapping("/candidate")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateCandidateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateCandidateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ thành công.",
                profileService.updateCandidateProfile(userId, req)));
    }

    /**
     * PUT /api/v1/profile/employer
     * Cập nhật hồ sơ nhà tuyển dụng / công ty.
     */
    @PutMapping("/employer")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateEmployerProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateEmployerProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ công ty thành công.",
                profileService.updateEmployerProfile(userId, req)));
    }

    /**
     * PUT /api/v1/profile/avatar
     * Cập nhật avatar/logo sau khi FE đã upload file lên S3/MinIO.
     * Body: { "avatarUrl": "https://s3.../new-avatar.jpg" }
     */
    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<Void>> updateAvatar(
            @AuthenticationPrincipal String userId,
            @RequestBody java.util.Map<String, String> body) {
        String url = body.get("avatarUrl");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("URL ảnh không được để trống."));
        }
        profileService.updateAvatar(userId, url);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ảnh thành công."));
    }

    /**
     * PUT /api/v1/profile/change-password
     * Theo đặc tả: sau khi đổi thành công FE xóa token và chuyển về login.
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ChangePasswordRequest req) {
        profileService.changePassword(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    /**
     * DELETE /api/v1/profile
     * Xóa tài khoản (soft delete → account_status = DELETED).
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal String userId) {
        profileService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.ok("Tài khoản đã được xóa. Rất tiếc khi bạn rời đi."));
    }
}
