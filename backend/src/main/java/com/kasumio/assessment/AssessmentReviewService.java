package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.dto.*;
import com.kasumio.opportunity.CandidateAliasService;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.student.Student;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Service for recruiter evaluation, candidate results inspection, and telemetry mapping.
 */
@Service
public class AssessmentReviewService {

    private final AssessmentAttemptRepository attemptRepository;
    private final QuestionSubmissionRepository submissionRepository;
    private final OpportunityRepository opportunityRepository;
    private final CandidateAliasService candidateAliasService;
    private final ObjectMapper objectMapper;

    public AssessmentReviewService(AssessmentAttemptRepository attemptRepository,
                                  QuestionSubmissionRepository submissionRepository,
                                  OpportunityRepository opportunityRepository,
                                  CandidateAliasService candidateAliasService,
                                  ObjectMapper objectMapper) {
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.opportunityRepository = opportunityRepository;
        this.candidateAliasService = candidateAliasService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AssessmentResultDto recordRecruiterDecision(Long attemptId, RecruiterDecisionRequest request, User recruiter) {
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only recruiters or administrators can record assessment evaluation decisions.");
        }

        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (request.getDecision() != null) {
            attempt.setRecruiterDecision(request.getDecision());
        }
        if (request.getNotes() != null) {
            attempt.setRecruiterNotes(request.getNotes().trim());
        }
        attempt = attemptRepository.save(attempt);

        return mapToResultDto(attempt, null);
    }

    @Transactional(readOnly = true)
    public AssessmentResultDto getAttemptResult(Long attemptId, Student student) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied to attempt results.");
        }

        return mapToResultDto(attempt, null, false);
    }

    @Transactional(readOnly = true)
    public AssessmentResultDto getCandidateAssessmentForRecruiter(Long opportunityId, Long studentId, User recruiter) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        if (recruiter.getRole() != Role.ADMIN && (opp.getRecruiter() == null || !opp.getRecruiter().getId().equals(recruiter.getId()))) {
            throw new AccessDeniedException("Only the opportunity recruiter can inspect candidate screening submissions.");
        }

        List<AssessmentAttempt> attempts = attemptRepository.findByOpportunityIdAndStudentId(opportunityId, studentId);
        if (attempts.isEmpty()) {
            throw new IllegalArgumentException("No assessment attempts completed by this candidate for opportunity " + opportunityId);
        }

        return mapToResultDto(attempts.get(0), null, true);
    }

    @Transactional(readOnly = true)
    public AssessmentResultDto getCandidateAssessmentByAliasForRecruiter(Long opportunityId, String candidateAlias, User recruiter) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        if (recruiter.getRole() != Role.ADMIN && (opp.getRecruiter() == null || !opp.getRecruiter().getId().equals(recruiter.getId()))) {
            throw new AccessDeniedException("Only the opportunity recruiter can inspect candidate screening submissions.");
        }

        Student student = candidateAliasService.findStudentByAlias(candidateAlias)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found for alias: " + candidateAlias));

        List<AssessmentAttempt> attempts = attemptRepository.findByOpportunityIdAndStudentId(opportunityId, student.getId());
        if (attempts.isEmpty()) {
            throw new IllegalArgumentException("No assessment attempts completed by candidate " + candidateAlias + " for opportunity " + opportunityId);
        }

        return mapToResultDto(attempts.get(0), null, true);
    }

    public AssessmentResultDto mapToResultDto(AssessmentAttempt attempt, Long verifiedEvidenceId) {
        return mapToResultDto(attempt, verifiedEvidenceId, true);
    }

    public AssessmentResultDto mapToResultDto(AssessmentAttempt attempt, Long verifiedEvidenceId, boolean isRecruiter) {
        List<QuestionSubmission> submissions = submissionRepository.findByAttemptOrderByCreatedAtAsc(attempt);
        List<AssessmentResultDto.QuestionResultItemDto> items = new ArrayList<>();

        for (QuestionSubmission s : submissions) {
            DeterministicEvaluationService.CandidateFeedback fb = null;
            try {
                fb = objectMapper.readValue(s.getFeedbackJson(), DeterministicEvaluationService.CandidateFeedback.class);
            } catch (Exception ignored) {}

            int maxPoints = s.getQuestion().getPoints();
            int pointsEarned = 0;
            if (s.getReviewedScore() != null) {
                pointsEarned = s.getReviewedScore();
            } else if (s.getEvaluatedScore() != null) {
                pointsEarned = s.getEvaluatedScore();
            } else if (s.getQuestion().getQuestionType().isCodeBased()) {
                if (s.getTotalTestCases() > 0) {
                    pointsEarned = (int) Math.round(((double) s.getTestCasesPassed() / s.getTotalTestCases()) * maxPoints);
                }
            } else if (s.getStatus() == SubmissionStatus.PASSED) {
                pointsEarned = maxPoints;
            }

            AssessmentResultDto.QuestionResultItemDto item = new AssessmentResultDto.QuestionResultItemDto(
                    s.getQuestion().getId(),
                    s.getQuestion().getTitle(),
                    s.getQuestion().getQuestionType(),
                    s.getQuestion().getDifficulty(),
                    s.getQuestion().getSkill() != null ? s.getQuestion().getSkill().getName() : "General",
                    pointsEarned,
                    maxPoints,
                    s.getStatus(),
                    s.getLanguage(),
                    s.getSubmittedCode(),
                    s.getExecutionTimeMs(),
                    s.getMemoryUsedKb(),
                    s.getTestCasesPassed(),
                    s.getTotalTestCases(),
                    fb
            );
            item.setTelemetryJson(s.getTelemetryJson());
            item.setCodeAnalysisJson(s.getCodeAnalysisJson());
            item.setSimilarityScore(s.getSimilarityScore());
            item.setEvaluationLayersJson(s.getEvaluationLayersJson());
            items.add(item);
        }

        int totalScore = attempt.getFinalScore() != null ? attempt.getFinalScore() : attempt.getScore();
        double pct = attempt.getMaxScore() > 0 ? ((double) totalScore / attempt.getMaxScore()) * 100.0 : 0.0;
        boolean passed = pct >= attempt.getAssessment().getPassingScore();

        // Release policy gating for candidates
        boolean isGatedForStudent = !isRecruiter
                && "REVIEW_REQUIRED".equalsIgnoreCase(attempt.getReleasePolicy())
                && !"RELEASED".equalsIgnoreCase(attempt.getReleaseStatus());

        List<AssessmentResultDto.QuestionResultItemDto> deliveredItems = isGatedForStudent
                ? Collections.emptyList()
                : items;

        String feedback = isGatedForStudent
                ? "Your assessment submission has been securely recorded. Detailed evaluation results will be published once reviewed by the technical hiring team."
                : attempt.getFeedbackSummary();

        AssessmentResultDto result = new AssessmentResultDto(
                attempt.getId(),
                attempt.getAssessment().getId(),
                attempt.getAssessment().getTitle(),
                attempt.getAssessment().getOpportunity().getId(),
                attempt.getAssessment().getOpportunity().getTitle(),
                totalScore,
                attempt.getMaxScore(),
                pct,
                passed,
                attempt.getAssessment().getPassingScore(),
                attempt.getAdaptiveDifficulty().name(),
                feedback,
                attempt.getCompletedAt(),
                verifiedEvidenceId,
                deliveredItems
        );
        result.setSelfAssessmentLevel(attempt.getSelfAssessmentLevel() != null ? attempt.getSelfAssessmentLevel().name() : "MEDIUM");
        result.setDemonstratedLevel(attempt.getDemonstratedLevel() != null ? attempt.getDemonstratedLevel().name() : "MEDIUM");
        result.setIntegrityStatus(attempt.getIntegrityStatus() != null ? attempt.getIntegrityStatus().name() : "NORMAL");
        result.setIntegritySignalsJson(attempt.getIntegritySignalsJson());
        result.setEvidenceGraphJson(attempt.getEvidenceGraphJson());
        result.setRecruiterDecision(attempt.getRecruiterDecision() != null ? attempt.getRecruiterDecision().name() : null);
        result.setReleasePolicy(attempt.getReleasePolicy());
        result.setReleaseStatus(attempt.getReleaseStatus());

        // Strict confidential recruiter notes protection: never leak to candidates
        if (isRecruiter) {
            result.setRecruiterNotes(attempt.getRecruiterNotes());
        } else {
            result.setRecruiterNotes(null);
        }

        return result;
    }
}
