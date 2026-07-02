package com.itjobhub.ITJobHub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @Column(name = "company_id", length = 36)
    private String companyId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "logo_url")
    private String logoUrl;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_status")
    private ProfileStatus profileStatus;

    private String industry;
    private String size;

    @Column(columnDefinition = "TEXT")
    private String description;

    public enum ProfileStatus { PENDING, APPROVED, HIDDEN, REJECTED, DELETED }
}
