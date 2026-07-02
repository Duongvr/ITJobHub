package com.itjobhub.ITJobHub.repository;

import com.itjobhub.ITJobHub.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, String> {

    boolean existsByUserIdAndJobId(String userId, String jobId);
    Optional<SavedJob> findByUserIdAndJobId(String userId, String jobId);
    void deleteByUserIdAndJobId(String userId, String jobId);
}
