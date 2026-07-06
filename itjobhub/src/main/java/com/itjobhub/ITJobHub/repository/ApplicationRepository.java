package com.itjobhub.ITJobHub.repository;

import com.itjobhub.ITJobHub.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<Application, String> {

    // UC_10: kiểm tra user đã từng ứng tuyển job này chưa (mọi trạng thái)
    boolean existsByUserIdAndJobId(String userId, String jobId);

    // Lấy danh sách đơn ứng tuyển của candidate
    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.job j
        JOIN FETCH j.company
        WHERE a.userId = :userId
        ORDER BY a.appliedDate DESC
    """)
    Page<Application> findByUserId(@Param("userId") String userId, Pageable pageable);
}
