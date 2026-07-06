package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemNotification {

    @Id
    @Column(name = "notification_id", length = 36)
    private String notificationId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "job_id")
    private String jobId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_date")
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
}
