package com.itjobhub.ITJobHub.controller;


import com.itjobhub.ITJobHub.dto.*;
import com.itjobhub.ITJobHub.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * POST /api/v1/applications
     * Nộp hồ sơ ứng tuyển (UC_10).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ApplyRequest req) {
        ApplicationResponse data = applicationService.apply(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Nộp hồ sơ thành công. Nhà tuyển dụng sẽ liên hệ với bạn.", data));
    }

    /**
     * GET /api/v1/applications?page=0&size=10
     * Danh sách đơn ứng tuyển của tôi.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ApplicationResponse> data = applicationService.getMyApplications(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Danh sách đơn ứng tuyển", data));
    }

    /**
     * GET /api/v1/applications/{id}
     * Xem chi tiết 1 đơn ứng tuyển.
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getDetail(
            @AuthenticationPrincipal String userId,
            @PathVariable String applicationId) {
        ApplicationResponse data = applicationService.getApplicationDetail(userId, applicationId);
        return ResponseEntity.ok(ApiResponse.ok("Chi tiết đơn ứng tuyển", data));
    }
}
