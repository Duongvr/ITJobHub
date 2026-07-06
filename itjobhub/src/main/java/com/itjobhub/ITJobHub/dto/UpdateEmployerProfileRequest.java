package com.itjobhub.ITJobHub.dto;


import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateEmployerProfileRequest {

    @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 255)
    private String companyName;

    private String location;
    private String industry;
    private String size;
    private String description;

    /** URL ảnh logo đã được upload lên S3/MinIO trước đó */
    private String logoUrl;
}
