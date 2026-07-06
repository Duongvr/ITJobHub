package com.itjobhub.ITJobHub.repository;

import com.itjobhub.ITJobHub.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository  extends JpaRepository<Company, String>{
}

