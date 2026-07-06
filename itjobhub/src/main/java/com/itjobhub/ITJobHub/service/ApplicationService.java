package com.itjobhub.ITJobHub.service;


import com.itjobhub.ITJobHub.dto.ApiResponse;
import com.itjobhub.ITJobHub.dto.ApplyRequest;
import com.itjobhub.ITJobHub.dto.ApplicationResponse;
import com.itjobhub.ITJobHub.dto.PagedResponse;
import com.itjobhub.ITJobHub.entity.*;
import com.itjobhub.ITJobHub.exception.AppException;
import com.itjobhub.ITJobHub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CvFileRepository      cvFileRepository;
    private final JobRepository         jobRepository;
    private final UserRepository        userRepository;
    private final SystemNotificationRepository notificationRepository;

    // ──────────────────────────────────────────
    // UC_10 – Nộp hồ sơ ứng tuyển
    // ──────────────────────────────────────────
    @Transactional
    public ApplicationResponse apply(String userId, ApplyRequest req) {

        // 1. Kiểm tra user là CANDIDATE và đang ACTIVE
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Tài khoản không tồn tại.", HttpStatus.NOT_FOUND));
        if (user.getRole() != User.Role.CANDIDATE) {
            throw new AppException("Chỉ ứng viên mới có thể ứng tuyển.", HttpStatus.FORBIDDEN);
        }

        // 2. Kiểm tra job tồn tại và đang PUBLISHED (theo đặc tả tiền điều kiện)
        Job job = jobRepository.findPublishedById(req.getJobId())
                .orElseThrow(() -> new AppException(
                        "Tin tuyển dụng không tồn tại hoặc đã đóng.", HttpStatus.NOT_FOUND));

        // 3. Kiểm tra đã ứng tuyển chưa – đặc tả: "chặn mọi trạng thái"
        if (applicationRepository.existsByUserIdAndJobId(userId, req.getJobId())) {
            throw new AppException("Bạn đã ứng tuyển vị trí này trước đó.", HttpStatus.CONFLICT);
        }

        // 4. Xác định CV sẽ dùng
        String cvId = resolveCvId(userId, req);

        // 5. Tạo bản ghi application
        Application app = Application.builder()
                .applicationId(UUID.randomUUID().toString())
                .jobId(req.getJobId())
                .cvId(cvId)
                .userId(userId)
                .coverLetter(req.getCoverLetter())
                .status(Application.ApplicationStatus.PENDING)
                .build();
        applicationRepository.save(app);

        // 6. Gửi thông báo cho nhà tuyển dụng (ghi vào system_notifications)
        sendNotificationToEmployer(job, userId);

        // 7. Trả về response (cần load lại để có JOIN company)
        Application saved = applicationRepository.findById(app.getApplicationId())
                .orElse(app);
        return ApplicationResponse.from(saved);
    }

    // ──────────────────────────────────────────
    // Lấy danh sách đơn ứng tuyển của candidate
    // ──────────────────────────────────────────
    public PagedResponse<ApplicationResponse> getMyApplications(String userId, int page, int size) {
        Page<Application> appPage = applicationRepository.findByUserId(userId, PageRequest.of(page, size));
        List<ApplicationResponse> content = appPage.getContent().stream()
                .map(ApplicationResponse::from).toList();

        return PagedResponse.<ApplicationResponse>builder()
                .content(content)
                .page(appPage.getNumber())
                .size(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .last(appPage.isLast())
                .build();
    }

    // ──────────────────────────────────────────
    // Xem chi tiết 1 đơn ứng tuyển (chỉ của chính mình)
    // ──────────────────────────────────────────
    public ApplicationResponse getApplicationDetail(String userId, String applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn ứng tuyển.", HttpStatus.NOT_FOUND));
        if (!app.getUserId().equals(userId)) {
            throw new AppException("Bạn không có quyền xem đơn ứng tuyển này.", HttpStatus.FORBIDDEN);
        }
        return ApplicationResponse.from(app);
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────

    /**
     * Xác định cvId sẽ dùng:
     * - Nếu req.cvId có giá trị → kiểm tra CV đó thuộc candidate, đang ACTIVE.
     * - Nếu req.newCvUrl có giá trị → tạo bản ghi cv_files mới.
     * - Nếu cả hai đều rỗng → tự động dùng CV mặc định của candidate.
     */
    private String resolveCvId(String userId, ApplyRequest req) {

        // Dùng CV có sẵn
        if (req.getCvId() != null && !req.getCvId().isBlank()) {
            CvFile cv = cvFileRepository.findById(req.getCvId())
                    .orElseThrow(() -> new AppException("CV không tồn tại.", HttpStatus.NOT_FOUND));
            if (!cv.getCandidateId().equals(userId)) {
                throw new AppException("CV này không thuộc về bạn.", HttpStatus.FORBIDDEN);
            }
            if (cv.getStatus() == CvFile.CvStatus.DELETED) {
                throw new AppException("CV đã bị xóa, vui lòng chọn CV khác.", HttpStatus.BAD_REQUEST);
            }
            return cv.getCvId();
        }

        // Upload CV mới
        if (req.getNewCvUrl() != null && !req.getNewCvUrl().isBlank()) {
            CvFile newCv = CvFile.builder()
                    .cvId(UUID.randomUUID().toString())
                    .candidateId(userId)
                    .fileUrl(req.getNewCvUrl())
                    .isDefault(false)
                    .status(CvFile.CvStatus.ACTIVE)
                    .build();
            cvFileRepository.save(newCv);
            return newCv.getCvId();
        }

        // Fallback: dùng CV mặc định
        return cvFileRepository
                .findByCandidateIdAndIsDefaultTrueAndStatus(userId, CvFile.CvStatus.ACTIVE)
                .map(CvFile::getCvId)
                .orElseThrow(() -> new AppException(
                        "Bạn chưa có CV nào. Vui lòng tải CV lên trước khi ứng tuyển.",
                        HttpStatus.BAD_REQUEST));
    }

    /** Ghi thông báo cho nhà tuyển dụng vào bảng system_notifications */
    private void sendNotificationToEmployer(Job job, String candidateUserId) {
        try {
            SystemNotification notification = SystemNotification.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .userId(job.getCompanyId())   // employer nhận thông báo
                    .jobId(job.getJobId())
                    .message("Có ứng viên mới ứng tuyển vào vị trí \"" + job.getTitle() + "\".")
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Không để lỗi thông báo làm fail cả giao dịch ứng tuyển
        }
    }
}