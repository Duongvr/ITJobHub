package com.itjobhub.ITJobHub.service;

import com.itjobhub.ITJobHub.dto.JobDetailResponse;
import com.itjobhub.ITJobHub.dto.JobSummaryResponse;
import com.itjobhub.ITJobHub.dto.PagedResponse;
import com.itjobhub.ITJobHub.entity.Job;
import com.itjobhub.ITJobHub.entity.SavedJob;
import com.itjobhub.ITJobHub.exception.AppException;
import com.itjobhub.ITJobHub.repository.JobRepository;
import com.itjobhub.ITJobHub.repository.SavedJobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;

    // Xem danh sách việc làm (có phân trang)
    public PagedResponse<JobSummaryResponse> getPublishedJobs(int page, int size, String currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage = jobRepository.findPublishedJobs(pageable);
        return buildPagedResponse(jobPage, currentUserId);
    }

    // Tìm kiếm cơ bản: keyword (title LIKE) + location
    public PagedResponse<JobSummaryResponse> searchJobs(String keyword, String location,
                                                        int page, int size, String currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage = jobRepository.searchJobs(keyword, location, pageable);
        return buildPagedResponse(jobPage, currentUserId);
    }

    // Xem chi tiết công việc
    public JobDetailResponse getJobDetail(String jobId, String currentUserId) {
        Job job = jobRepository.findPublishedById(jobId)
                .orElseThrow(() -> new AppException(
                        "Công việc không tồn tại hoặc đã bị gỡ bỏ.", HttpStatus.NOT_FOUND));

        boolean saved = currentUserId != null
                && savedJobRepository.existsByUserIdAndJobId(currentUserId, jobId);

        return JobDetailResponse.from(job, saved);
    }

    // Lưu / Bỏ lưu công việc (dùng ở cả UC_01, UC_02, UC_03)
    // Trả về true nếu đang lưu sau thao tác, false nếu đã bỏ lưu
    @Transactional
    public boolean toggleSaveJob(String userId, String jobId) {
        // Kiểm tra job tồn tại trước khi cho lưu
        jobRepository.findPublishedById(jobId)
                .orElseThrow(() -> new AppException("Công việc không tồn tại.", HttpStatus.NOT_FOUND));

        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
            return false; // đã bỏ lưu
        }

        SavedJob saved = SavedJob.builder()
                .savedId(UUID.randomUUID().toString())
                .userId(userId)
                .jobId(jobId)
                .build();
        savedJobRepository.save(saved);
        return true; // đã lưu
    }

    // Helper: map Page<Job> → PagedResponse<JobSummaryResponse>
    private PagedResponse<JobSummaryResponse> buildPagedResponse(Page<Job> jobPage, String userId) {
        // Lấy tập jobId mà user đã lưu (1 truy vấn) để tránh N+1
        Set<String> savedJobIds = userId == null ? Set.of()
                : jobPage.getContent().stream()
                .map(Job::getJobId)
                .filter(id -> savedJobRepository.existsByUserIdAndJobId(userId, id))
                .collect(Collectors.toSet());

        List<JobSummaryResponse> content = jobPage.getContent().stream()
                .map(j -> JobSummaryResponse.from(j, savedJobIds.contains(j.getJobId())))
                .toList();

        return PagedResponse.<JobSummaryResponse>builder()
                .content(content)
                .page(jobPage.getNumber())
                .size(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .last(jobPage.isLast())
                .build();
    }
}