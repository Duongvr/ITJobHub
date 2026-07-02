package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="jobs")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Job {

    @Id
    @Column(name = "job_id", length = 36)
    private String jobId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String salary;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "company_id")
    private String companyId;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType;

    @Column(name = "posted_date")
    private LocalDateTime postedDate;

    // Quan hệ đến Company để JOIN lấy thông tin công ty
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", insertable = false, updatable = false)
    private Company company;

    public enum JobStatus { DRAFT, PENDING, PUBLISHED, HIDDEN, CLOSED, REJECTED }
    public enum JobType   { FULL_TIME, PART_TIME, REMOTE, FREELANCE }


}
