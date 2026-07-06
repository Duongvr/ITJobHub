package com.itjobhub.ITJobHub.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyRequest {

    @NotBlank(message = "Vui lòng chọn công việc muốn ứng tuyển")
    private String jobId;

    /**
     * Nếu candidate chọn CV có sẵn → truyền cvId.
     * Nếu tải CV mới → để trống cvId, truyền newCvUrl (URL đã upload lên S3/MinIO).
     * Bắt buộc phải có 1 trong 2.
     */
    private String cvId;

    /** URL file CV mới (nếu không dùng CV có sẵn) */
    private String newCvUrl;

    private String coverLetter;
}
