package com.kasumio.assessment;

import com.kasumio.opportunity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Optional<Assessment> findByOpportunity(Opportunity opportunity);
    Optional<Assessment> findByOpportunityId(Long opportunityId);
    List<Assessment> findAllByOrderByCreatedAtDesc();
}
