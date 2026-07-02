package com.itjobhub.ITJobHub.dto;

import com.itjobhub.ITJobHub.entity.Job;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobDetailResponse {

    // --- Thông tin Job đầy đủ ---
    private String jobId;
    private String title;
    private String description;
    private String requirements;
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
    private String companyDescription;

    // --- Trạng thái với user ---
    private boolean isSaved;

    public static JobDetailResponse from(Job job, boolean isSaved) {
        return JobDetailResponse.builder()
                .jobId(job.getJobId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .salary(job.getSalary())
                .location(job.getLocation())
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .postedDate(job.getPostedDate())
                .companyId(job.getCompany().getCompanyId())
                .companyName(job.getCompany().getCompanyName())
                .logoUrl(job.getCompany().getLogoUrl())
                .industry(job.getCompany().getIndustry())
                .size(job.getCompany().getSize())
                .companyDescription(job.getCompany().getDescription())
                .isSaved(isSaved)
                .build();
    }
}
