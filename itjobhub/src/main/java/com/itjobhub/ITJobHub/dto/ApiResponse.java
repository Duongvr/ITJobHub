package com.itjobhub.ITJobHub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> ok(String message) {
        return ApiResponse.<T>builder().success(true).message(message).build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).message(message).build();
    }

    @Data
    public static class GoogleLoginRequest {
        /** ID Token (JWT) do Google trả về cho FE sau khi người dùng đăng nhập Google (Google Identity Services). */
        @NotBlank
        private String idToken;

        /** Vai trò mong muốn khi tạo tài khoản mới qua Google (chỉ áp dụng lần đầu đăng ký). */
        private String role; // CANDIDATE | EMPLOYER, mặc định CANDIDATE
    }
}
