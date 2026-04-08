package com.atlasi.backend.repository;

import com.atlasi.backend.model.AtlasiRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtlasiRequestRepository extends JpaRepository<AtlasiRequest, Long> {
}
