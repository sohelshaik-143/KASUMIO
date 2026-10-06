package com.kasumio.agent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRecommendationRepository extends JpaRepository<CandidateRecommendation, Long> {
    List<CandidateRecommendation> findByJobOrderByOverallScoreDesc(RecruiterAutomationJob job);
    List<CandidateRecommendation> findByJobAndApprovalStatus(RecruiterAutomationJob job, ApprovalStatus status);
}
