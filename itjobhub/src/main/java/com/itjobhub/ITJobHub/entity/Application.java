package com.itjobhub.ITJobHub.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @Column(name = "application_id", length = 36)
    private String applicationId;

    @Column(name = "job_id")
    private String jobId;

    @Column(name = "cv_id")
    private String cvId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "applied_date")
    @Builder.Default
    private LocalDateTime appliedDate = LocalDateTime.now();

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    // JOIN để lấy thông tin job khi cần
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private Job job;

    public enum ApplicationStatus {
        PENDING, REVIEWING, INTERVIEWING, APPROVED, REJECTED, ARCHIVED
    }
}
