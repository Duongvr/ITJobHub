package com.itjobhub.ITJobHub.controller;

import com.itjobhub.ITJobHub.dto.ApiResponse;
import com.itjobhub.ITJobHub.dto.JobDetailResponse;
import com.itjobhub.ITJobHub.dto.JobSummaryResponse;
import com.itjobhub.ITJobHub.dto.PagedResponse;
import com.itjobhub.ITJobHub.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /**
     *  Danh sách việc làm (công khai, không cần đăng nhập)
     * GET /api/v1/jobs?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<JobSummaryResponse>>> getJobs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String currentUserId // null nếu là Guest
    ) {
        PagedResponse<JobSummaryResponse> data = jobService.getPublishedJobs(page, size, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Danh sách việc làm", data));
    }

    /**
     *  Tìm kiếm cơ bản
     * GET /api/v1/jobs/search?keyword=Java&location=Hà Nội&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<JobSummaryResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String currentUserId
    ) {
        PagedResponse<JobSummaryResponse> data = jobService.searchJobs(keyword, location, page, size, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Kết quả tìm kiếm", data));
    }

    /**
     *  Xem chi tiết công việc
     * GET /api/v1/jobs/{jobId}
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobDetailResponse>> getJobDetail(
            @PathVariable String jobId,
            @AuthenticationPrincipal String currentUserId
    ) {
        JobDetailResponse data = jobService.getJobDetail(jobId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Chi tiết công việc", data));
    }

    /**
     * Lưu / bỏ lưu công việc (yêu cầu đăng nhập – CANDIDATE)
     * POST /api/v1/jobs/{jobId}/save
     */
    @PostMapping("/{jobId}/save")
    public ResponseEntity<ApiResponse<Boolean>> toggleSave(
            @PathVariable String jobId,
            @AuthenticationPrincipal String currentUserId
    ) {
        boolean isSaved = jobService.toggleSaveJob(currentUserId, jobId);
        String msg = isSaved ? "Đã lưu công việc." : "Đã bỏ lưu công việc.";
        return ResponseEntity.ok(ApiResponse.ok(msg, isSaved));
    }
}