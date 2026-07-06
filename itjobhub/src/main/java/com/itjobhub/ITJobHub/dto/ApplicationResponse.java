package com.itjobhub.ITJobHub.dto;

import com.itjobhub.ITJobHub.entity.Application;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private String applicationId;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogoUrl;
    private String cvId;
    private String coverLetter;
    private String status;
    private LocalDateTime appliedDate;

    public static ApplicationResponse from(Application app) {
        return ApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .jobId(app.getJobId())
                .jobTitle(app.getJob() != null ? app.getJob().getTitle() : null)
                .companyName(app.getJob() != null && app.getJob().getCompany() != null
                        ? app.getJob().getCompany().getCompanyName() : null)
                .companyLogoUrl(app.getJob() != null && app.getJob().getCompany() != null
                        ? app.getJob().getCompany().getLogoUrl() : null)
                .cvId(app.getCvId())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus().name())
                .appliedDate(app.getAppliedDate())
                .build();
    }
}
