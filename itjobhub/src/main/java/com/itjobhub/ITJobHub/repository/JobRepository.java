package com.itjobhub.ITJobHub.repository;

import com.itjobhub.ITJobHub.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, String> {

    //  Lấy danh sách job PUBLISHED, JOIN company, sort theo posted_date mới nhất
    @Query("""
        SELECT j FROM Job j
        JOIN FETCH j.company c
        WHERE j.status = 'PUBLISHED'
        ORDER BY j.postedDate DESC
    """)
    Page<Job> findPublishedJobs(Pageable pageable);

    //  Tìm kiếm theo keyword (title LIKE) và location
    // Nếu keyword hoặc location rỗng thì bỏ qua điều kiện đó
    @Query("""
        SELECT j FROM Job j
        JOIN FETCH j.company c
        WHERE j.status = 'PUBLISHED'
          AND (:keyword IS NULL OR :keyword = ''
               OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:location IS NULL OR :location = ''
               OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        ORDER BY j.postedDate DESC
    """)
    Page<Job> searchJobs(@Param("keyword") String keyword,
                         @Param("location") String location,
                         Pageable pageable);

    //  Lấy chi tiết 1 job, chỉ hiển thị nếu PUBLISHED
    @Query("""
        SELECT j FROM Job j
        JOIN FETCH j.company c
        WHERE j.jobId = :jobId AND j.status = 'PUBLISHED'
    """)
    Optional<Job> findPublishedById(@Param("jobId") String jobId);
}
