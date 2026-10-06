package com.kasumio.agent;

import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterAutomationJobRepository extends JpaRepository<RecruiterAutomationJob, Long> {
    Optional<RecruiterAutomationJob> findByJobId(String jobId);
    List<RecruiterAutomationJob> findByRecruiterOrderByCreatedAtDesc(User recruiter);
    List<RecruiterAutomationJob> findByOpportunityId(Long opportunityId);
}
