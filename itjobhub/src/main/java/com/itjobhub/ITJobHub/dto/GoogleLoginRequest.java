package com.itjobhub.ITJobHub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    /** ID Token (JWT) do Google trả về cho FE sau khi người dùng đăng nhập Google (Google Identity Services). */
    @NotBlank
    private String idToken;

    /** Vai trò mong muốn khi tạo tài khoản mới qua Google (chỉ áp dụng lần đầu đăng ký). */
    private String role; // CANDIDATE | EMPLOYER, mặc định CANDIDATE
}
