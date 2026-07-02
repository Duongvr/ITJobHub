package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJob {

    @Id
    @Column(name = "saved_id", length = 36)
    private String savedId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "job_id")
    private String jobId;

    @Column(name = "saved_date")
    @Builder.Default
    private LocalDateTime savedDate = LocalDateTime.now();
}
