package com.itjobhub.ITJobHub.service;


import com.fasterxml.jackson.databind.ObjectMapper;

import com.itjobhub.ITJobHub.dto.ChangePasswordRequest;
import com.itjobhub.ITJobHub.dto.ProfileResponse;
import com.itjobhub.ITJobHub.dto.UpdateCandidateProfileRequest;
import com.itjobhub.ITJobHub.dto.UpdateEmployerProfileRequest;
import com.itjobhub.ITJobHub.entity.Candidate;
import com.itjobhub.ITJobHub.entity.Company;
import com.itjobhub.ITJobHub.entity.User;
import com.itjobhub.ITJobHub.exception.AppException;
import com.itjobhub.ITJobHub.repository.CandidateRepository;
import com.itjobhub.ITJobHub.repository.CompanyRepository;
import com.itjobhub.ITJobHub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder     passwordEncoder;
    private final ObjectMapper        objectMapper;   // Bean có sẵn từ Spring Boot

    // ──────────────────────────────────────────
    // Lấy thông tin profile hiện tại
    // ──────────────────────────────────────────
    public ProfileResponse getProfile(String userId) {
        User user = getActiveUser(userId);

        return switch (user.getRole()) {
            case CANDIDATE -> {
                Candidate c = candidateRepository.findById(userId)
                        .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ ứng viên.", HttpStatus.NOT_FOUND));
                yield ProfileResponse.fromCandidate(user, c);
            }
            case EMPLOYER -> {
                Company co = companyRepository.findById(userId)
                        .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ công ty.", HttpStatus.NOT_FOUND));
                yield ProfileResponse.fromEmployer(user, co);
            }
            case ADMIN -> ProfileResponse.builder()
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole().name())
                    .build();
        };
    }

    // ──────────────────────────────────────────
    // Cập nhật profile (candidate)
    // ──────────────────────────────────────────
    @Transactional
    public ProfileResponse updateCandidateProfile(String userId, UpdateCandidateProfileRequest req) {
        User user = getActiveUser(userId);
        if (user.getRole() != User.Role.CANDIDATE) {
            throw new AppException("Chỉ ứng viên mới có thể cập nhật loại hồ sơ này.", HttpStatus.FORBIDDEN);
        }

        // Cập nhật bảng users
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        userRepository.save(user);

        // Cập nhật bảng candidates
        Candidate c = candidateRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ.", HttpStatus.NOT_FOUND));

        if (req.getFullName()        != null) c.setFullName(req.getFullName());
        if (req.getBio()             != null) c.setBio(req.getBio());
        if (req.getExperience()      != null) c.setExperience(req.getExperience());
        if (req.getEducation()       != null) c.setEducation(req.getEducation());
        if (req.getPreferredLocation() != null) c.setPreferredLocation(req.getPreferredLocation());

        if (req.getJobLevel() != null) {
            try {
                c.setJobLevel(Candidate.JobLevel.valueOf(req.getJobLevel().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException("Cấp bậc không hợp lệ.", HttpStatus.BAD_REQUEST);
            }
        }

        if (req.getSkills() != null) {
            try {
                c.setSkills(objectMapper.writeValueAsString(req.getSkills()));
            } catch (Exception e) {
                throw new AppException("Dữ liệu kỹ năng không hợp lệ.", HttpStatus.BAD_REQUEST);
            }
        }

        candidateRepository.save(c);
        return ProfileResponse.fromCandidate(user, c);
    }

    // ──────────────────────────────────────────
    // Cập nhật profile (employer)
    // ──────────────────────────────────────────
    @Transactional
    public ProfileResponse updateEmployerProfile(String userId, UpdateEmployerProfileRequest req) {
        User user = getActiveUser(userId);
        if (user.getRole() != User.Role.EMPLOYER) {
            throw new AppException("Chỉ nhà tuyển dụng mới có thể cập nhật loại hồ sơ này.", HttpStatus.FORBIDDEN);
        }

        if (req.getPhone() != null) user.setPhone(req.getPhone());
        userRepository.save(user);

        Company co = companyRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ công ty.", HttpStatus.NOT_FOUND));

        if (req.getCompanyName()  != null) co.setCompanyName(req.getCompanyName());
        if (req.getLocation()     != null) co.setLocation(req.getLocation());
        if (req.getIndustry()     != null) co.setIndustry(req.getIndustry());
        if (req.getSize()         != null) co.setSize(req.getSize());
        if (req.getDescription()  != null) co.setDescription(req.getDescription());
        if (req.getLogoUrl()      != null) co.setLogoUrl(req.getLogoUrl());

        companyRepository.save(co);
        return ProfileResponse.fromEmployer(user, co);
    }

    // ──────────────────────────────────────────
    // Đổi avatar (lưu URL sau khi FE upload lên S3/MinIO)
    // ──────────────────────────────────────────
    @Transactional
    public void updateAvatar(String userId, String avatarUrl) {
        User user = getActiveUser(userId);

        if (user.getRole() == User.Role.CANDIDATE) {
            Candidate c = candidateRepository.findById(userId)
                    .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ.", HttpStatus.NOT_FOUND));
            c.setAvatarUrl(avatarUrl);
            candidateRepository.save(c);
        } else if (user.getRole() == User.Role.EMPLOYER) {
            Company co = companyRepository.findById(userId)
                    .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ.", HttpStatus.NOT_FOUND));
            co.setLogoUrl(avatarUrl);
            companyRepository.save(co);
        }
    }

    // ──────────────────────────────────────────
    // Đổi mật khẩu – theo đặc tả: phải đăng nhập lại sau khi đổi
    // ──────────────────────────────────────────
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest req) {
        User user = getActiveUser(userId);

        if (user.getPassword() == null) {
            throw new AppException(
                    "Tài khoản này đăng nhập qua " + user.getAuthProvider() +
                            ", không có mật khẩu để thay đổi.", HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new AppException("Mật khẩu hiện tại không đúng.", HttpStatus.BAD_REQUEST);
        }

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new AppException("Mật khẩu xác nhận không khớp.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        // FE cần xóa token và chuyển về trang đăng nhập sau khi nhận 200
    }

    // ──────────────────────────────────────────
    // Xóa tài khoản (soft delete) – đặc tả: status = DELETED
    // ──────────────────────────────────────────
    @Transactional
    public void deleteAccount(String userId) {
        User user = getActiveUser(userId);
        user.setAccountStatus(User.AccountStatus.DELETED);
        userRepository.save(user);
    }

    // ──────────────────────────────────────────
    private User getActiveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND));
        if (user.getAccountStatus() == User.AccountStatus.DELETED) {
            throw new AppException("Tài khoản đã bị xóa.", HttpStatus.FORBIDDEN);
        }
        if (user.getAccountStatus() == User.AccountStatus.LOCKED) {
            throw new AppException("Tài khoản đang bị khóa.", HttpStatus.FORBIDDEN);
        }
        return user;
    }
}