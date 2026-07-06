package com.itjobhub.ITJobHub.dto;


import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateCandidateProfileRequest {

    @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 255)
    private String fullName;

    private String bio;

    /**
     * Mảng kỹ năng dưới dạng JSON string: ["Java","Spring Boot"]
     * FE gửi lên dưới dạng List<String>, đây sẽ được service chuyển thành JSON.
     */
    private List<String> skills;

    private String experience;
    private String education;
    private String preferredLocation;

    /**
     * INTERN | FRESHER | JUNIOR | MIDDLE | SENIOR | MANAGER
     */
    private String jobLevel;
}