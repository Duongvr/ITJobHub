package com.itjobhub.ITJobHub.repository;


import com.itjobhub.ITJobHub.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, String> {
}
