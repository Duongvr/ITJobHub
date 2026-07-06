package com.itjobhub.ITJobHub.dto;


import com.itjobhub.ITJobHub.entity.Candidate;
import com.itjobhub.ITJobHub.entity.Company;
import com.itjobhub.ITJobHub.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {

    // Thông tin từ bảng users
    private String userId;
    private String email;
    private String phone;
    private String role;
    private String authProvider;

    // Thông tin từ bảng candidates (nếu role = CANDIDATE)
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String skills;          // JSON string
    private String experience;
    private String education;
    private String preferredLocation;
    private String jobLevel;

    // Thông tin từ bảng companies (nếu role = EMPLOYER)
    private String companyName;
    private String logoUrl;
    private String location;
    private String industry;
    private String size;
    private String companyDescription;
    private String profileStatus;

    public static ProfileResponse fromCandidate(User user, Candidate candidate) {
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .fullName(candidate.getFullName())
                .avatarUrl(candidate.getAvatarUrl())
                .bio(candidate.getBio())
                .skills(candidate.getSkills())
                .experience(candidate.getExperience())
                .education(candidate.getEducation())
                .preferredLocation(candidate.getPreferredLocation())
                .jobLevel(candidate.getJobLevel() != null ? candidate.getJobLevel().name() : null)
                .build();
    }

    public static ProfileResponse fromEmployer(User user, Company company) {
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .companyName(company.getCompanyName())
                .logoUrl(company.getLogoUrl())
                .location(company.getLocation())
                .industry(company.getIndustry())
                .size(company.getSize())
                .companyDescription(company.getDescription())
                .profileStatus(company.getProfileStatus() != null ? company.getProfileStatus().name() : null)
                .build();
    }
}
