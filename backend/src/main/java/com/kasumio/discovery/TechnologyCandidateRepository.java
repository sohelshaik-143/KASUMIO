package com.kasumio.discovery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnologyCandidateRepository extends JpaRepository<TechnologyCandidate, Long> {
    Optional<TechnologyCandidate> findByRawNameIgnoreCase(String rawName);
    Optional<TechnologyCandidate> findByNormalizedNameIgnoreCase(String normalizedName);
    List<TechnologyCandidate> findByStatusOrderByOccurrenceCountDesc(String status);
    List<TechnologyCandidate> findAllByOrderByCreatedAtDesc();
}
