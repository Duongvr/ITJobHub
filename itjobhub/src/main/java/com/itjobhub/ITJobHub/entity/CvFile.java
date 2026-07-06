package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvFile {

    @Id
    @Column(name = "cv_id", length = 36)
    private String cvId;

    @Column(name = "candidate_id")
    private String candidateId;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "parsed_text", columnDefinition = "json")
    private String parsedText;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "upload_date")
    @Builder.Default
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CvStatus status = CvStatus.ACTIVE;

    public enum CvStatus { ACTIVE, DELETED }
}
