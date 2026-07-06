package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @Column(name = "candidate_id", length = 36)
    private String candidateId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Lưu JSON string: ["Java","Spring Boot","MySQL"]
    @Column(columnDefinition = "json")
    private String skills;

    private String experience;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(name = "preferred_location")
    private String preferredLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_level")
    private JobLevel jobLevel;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", insertable = false, updatable = false)
    private User user;

    public enum JobLevel { INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR, MANAGER }
}
