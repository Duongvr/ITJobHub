package com.itjobhub.ITJobHub.dto;


import com.itjobhub.ITJobHub.entity.Job;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobSummaryResponse {

    // --- Thông tin Job ---
    private String jobId;
    private String title;
    private String salary;
    private String location;
    private String jobType;
    private LocalDateTime postedDate;

    // --- Thông tin Company ---
    private String companyId;
    private String companyName;
    private String logoUrl;
    private String industry;
    private String size;

    // --- Trạng thái với user đang đăng nhập ---
    private boolean isSaved;   // true nếu user đã lưu job này

    public static JobSummaryResponse from(Job job, boolean isSaved) {
        return JobSummaryResponse.builder()
                .jobId(job.getJobId())
                .title(job.getTitle())
                .salary(job.getSalary())
                .location(job.getLocation())
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .postedDate(job.getPostedDate())
                .companyId(job.getCompany().getCompanyId())
                .companyName(job.getCompany().getCompanyName())
                .logoUrl(job.getCompany().getLogoUrl())
                .industry(job.getCompany().getIndustry())
                .size(job.getCompany().getSize())
                .isSaved(isSaved)
                .build();
    }
}
