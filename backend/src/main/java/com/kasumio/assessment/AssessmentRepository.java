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
    Optional<Assessment> findFirstByOpportunityOrderByVersionNumberDesc(Opportunity opportunity);
    Optional<Assessment> findFirstByOpportunityIdOrderByVersionNumberDesc(Long opportunityId);
    Optional<Assessment> findFirstByOpportunityAndStatus(Opportunity opportunity, AssessmentStatus status);
    List<Assessment> findAllByOpportunityOrderByVersionNumberDesc(Opportunity opportunity);
    List<Assessment> findAllByOrderByCreatedAtDesc();
}
