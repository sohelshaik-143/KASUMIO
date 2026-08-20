package com.kasumio.discovery;

import com.kasumio.discovery.dto.FeedbackAnalyticsDto;
import com.kasumio.discovery.dto.RecommendationFeedbackRequest;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.student.Student;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackIntelligenceService {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationFeedbackRepository feedbackRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final OpportunityRepository opportunityRepository;

    public FeedbackIntelligenceService(
            RecommendationRepository recommendationRepository,
            RecommendationFeedbackRepository feedbackRepository,
            UserPreferenceRepository userPreferenceRepository,
            OpportunityRepository opportunityRepository) {
        this.recommendationRepository = recommendationRepository;
        this.feedbackRepository = feedbackRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.opportunityRepository = opportunityRepository;
    }

    /**
     * Submit deterministic feedback on a recommendation.
     * Updates user personalization preferences without directly modifying global taxonomy.
     */
    @Transactional
    public void submitFeedback(Student student, Long opportunityId, RecommendationFeedbackRequest request) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        Recommendation rec = recommendationRepository.findByStudentAndOpportunity(student, opportunity)
                .orElseGet(() -> recommendationRepository.save(new Recommendation(
                        student,
                        opportunity,
                        com.kasumio.opportunity.ReadinessState.READY,
                        com.kasumio.opportunity.EvidenceRoi.MEDIUM
                )));

        RecommendationFeedback feedback = new RecommendationFeedback(
                rec,
                student,
                opportunity,
                request.getFeedbackType(),
                request.getFeedbackText()
        );
        feedbackRepository.save(feedback);

        // Process personalization signals deterministically
        applyUserPersonalizationSignals(student, opportunity, request.getFeedbackType());

        // Process system-level review triggers (e.g. >= 5 mismatch reports)
        checkSystemReviewTriggers(opportunity);
    }

    /**
     * Internal analytics for recommendation system quality.
     */
    @Transactional(readOnly = true)
    public FeedbackAnalyticsDto getFeedbackAnalytics() {
        long totalRecommendations = recommendationRepository.count();
        long totalFeedback = feedbackRepository.count();
        List<RecommendationFeedback> allFeedback = feedbackRepository.findAll();

        long relevantCount = allFeedback.stream().filter(f -> "RELEVANT".equalsIgnoreCase(f.getFeedbackType()) || "HELPFUL".equalsIgnoreCase(f.getFeedbackType())).count();
        long notRelevantCount = allFeedback.stream().filter(f -> "NOT_RELEVANT".equalsIgnoreCase(f.getFeedbackType()) || "NOT_HELPFUL".equalsIgnoreCase(f.getFeedbackType())).count();
        long techCorrectionCount = allFeedback.stream().filter(f -> "WRONG_REQUIREMENT".equalsIgnoreCase(f.getFeedbackType()) || "WRONG_TECHNOLOGY".equalsIgnoreCase(f.getFeedbackType())).count();

        double acceptanceRate = totalFeedback > 0 ? ((double) relevantCount / totalFeedback) * 100.0 : 0.0;
        double negativeFeedbackRate = totalFeedback > 0 ? ((double) notRelevantCount / totalFeedback) * 100.0 : 0.0;

        return new FeedbackAnalyticsDto(
                totalRecommendations,
                totalFeedback,
                relevantCount,
                notRelevantCount,
                techCorrectionCount,
                acceptanceRate,
                negativeFeedbackRate
        );
    }

    private void applyUserPersonalizationSignals(Student student, Opportunity opportunity, String feedbackType) {
        if ("NOT_MY_CAREER_DIRECTION".equalsIgnoreCase(feedbackType) || "NOT_RELEVANT".equalsIgnoreCase(feedbackType)) {
            // Register role avoidance signal for this student
            String roleKey = opportunity.getType().name();
            Optional<UserPreference> existing = userPreferenceRepository.findByStudentAndPreferenceKeyAndPreferenceValue(
                    student, "AVOID_ROLE_TYPE", roleKey
            );
            if (existing.isEmpty()) {
                userPreferenceRepository.save(new UserPreference(student, "AVOID_ROLE_TYPE", roleKey, 0.5));
            }
        } else if ("LOCATION_PROBLEM".equalsIgnoreCase(feedbackType)) {
            if (opportunity.getLocation() != null && !opportunity.getLocation().isBlank()) {
                Optional<UserPreference> existing = userPreferenceRepository.findByStudentAndPreferenceKeyAndPreferenceValue(
                        student, "AVOID_LOCATION", opportunity.getLocation()
                );
                if (existing.isEmpty()) {
                    userPreferenceRepository.save(new UserPreference(student, "AVOID_LOCATION", opportunity.getLocation(), 0.5));
                }
            }
        }
    }

    private void checkSystemReviewTriggers(Opportunity opportunity) {
        long mismatchCount = feedbackRepository.countTechnologyMismatchReports(opportunity.getId());
        if (mismatchCount >= 5) {
            // Flag opportunity extraction for administrative review
            opportunity.setVerificationStatus("FLAGGED_FOR_REVIEW");
            opportunityRepository.save(opportunity);
        }
    }
}
