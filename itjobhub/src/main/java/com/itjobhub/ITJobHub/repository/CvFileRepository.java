package com.itjobhub.ITJobHub.repository;

import com.itjobhub.ITJobHub.entity.CvFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvFileRepository extends JpaRepository<CvFile, String> {

    // Lấy danh sách CV đang ACTIVE của candidate
    List<CvFile> findByCandidateIdAndStatusOrderByUploadDateDesc(
            String candidateId, CvFile.CvStatus status);

    // Lấy CV mặc định
    Optional<CvFile> findByCandidateIdAndIsDefaultTrueAndStatus(
            String candidateId, CvFile.CvStatus status);

    // Đếm số CV đang ACTIVE
    int countByCandidateIdAndStatus(String candidateId, CvFile.CvStatus status);
}
