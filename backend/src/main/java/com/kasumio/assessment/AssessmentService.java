package com.kasumio.assessment;

import com.kasumio.assessment.dto.*;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.student.Student;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Main Assessment Service coordinator.
 * 
 * Coordinates assessment generation, blueprint updates, catalog listing,
 * and delegates attempt and review workflows to dedicated services.
 */
@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final OpportunityRepository opportunityRepository;
    private final AssessmentGenerationService generationService;
    private final AssessmentAttemptService attemptService;
    private final AssessmentReviewService reviewService;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             AssessmentQuestionRepository questionRepository,
                             OpportunityRepository opportunityRepository,
                             AssessmentGenerationService generationService,
                             AssessmentAttemptService attemptService,
                             AssessmentReviewService reviewService) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.opportunityRepository = opportunityRepository;
        this.generationService = generationService;
        this.attemptService = attemptService;
        this.reviewService = reviewService;
    }

    @Transactional
    public AssessmentDto getOrCreateAssessmentForOpportunity(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));

        Assessment assessment = assessmentRepository.findFirstByOpportunityOrderByVersionNumberDesc(opportunity)
                .orElseGet(() -> {
                    AssessmentGenerationService.BlueprintTemplate blueprint = generationService.generateBlueprint(opportunity);
                    return generationService.instantiateAssessment(opportunity, blueprint);
                });

        return mapToDto(assessment);
    }

    @Transactional
    public AssessmentDto updateAssessment(Long assessmentId, UpdateAssessmentRequest request, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));

        Opportunity opp = assessment.getOpportunity();
        if (recruiter.getRole() != Role.ADMIN && (opp.getRecruiter() == null || !opp.getRecruiter().getId().equals(recruiter.getId()))) {
            throw new AccessDeniedException("Only the opportunity creator can edit this assessment blueprint.");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            assessment.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            assessment.setDescription(request.getDescription().trim());
        }
        if (request.getTimeLimitMinutes() != null && request.getTimeLimitMinutes() > 0) {
            assessment.setTimeLimitMinutes(request.getTimeLimitMinutes());
        }
        if (request.getPassingScore() != null && request.getPassingScore() >= 0 && request.getPassingScore() <= 100) {
            assessment.setPassingScore(request.getPassingScore());
        }

        assessment = assessmentRepository.save(assessment);
        return mapToDto(assessment);
    }

    @Transactional(readOnly = true)
    public List<AssessmentDto> getAllAssessments() {
        return assessmentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Attempt Execution Delegations
    public AssessmentAttemptDto startAttempt(Long assessmentId, Student student, StartAssessmentRequest request) {
        return attemptService.startAttempt(assessmentId, student, request);
    }

    public AssessmentAttemptDto startAttempt(Long assessmentId, Student student) {
        return attemptService.startAttempt(assessmentId, student, new StartAssessmentRequest(SelfAssessmentLevel.MEDIUM, true));
    }

    public Optional<QuestionDetailDto> getNextAdaptiveQuestion(Long attemptId, Student student) {
        return attemptService.getNextAdaptiveQuestion(attemptId, student);
    }

    public RunCodeResponse runCode(Long attemptId, Long questionId, RunCodeRequest request, Student student) {
        return attemptService.runCode(attemptId, questionId, request, student);
    }

    public SubmitQuestionResponse submitQuestion(Long attemptId, SubmitQuestionRequest request, Student student) {
        return attemptService.submitQuestion(attemptId, request, student);
    }

    public void saveDraft(Long attemptId, SubmitQuestionRequest request, Student student) {
        attemptService.saveDraft(attemptId, request, student);
    }

    public TelemetryResponse recordTelemetry(Long attemptId, TelemetryIngestRequest req, Student student) {
        return attemptService.recordTelemetry(attemptId, req, student);
    }

    public AssessmentAttemptDto overturnIntegrityLock(Long attemptId, String reason, User recruiter) {
        return attemptService.overturnIntegrityLock(attemptId, reason, recruiter);
    }

    public AttemptIntegrityDetailsDto getAttemptIntegrity(Long attemptId, User user) {
        return attemptService.getAttemptIntegrityDetails(attemptId, user);
    }

    public AssessmentResultDto completeAttempt(Long attemptId, Student student) {
        return attemptService.completeAttempt(attemptId, student);
    }

    public AssessmentResultDto autoTakeAssessment(Long assessmentId, Student student) {
        return attemptService.autoTakeAssessment(assessmentId, student);
    }

    // Review & Diagnostics Delegations
    public AssessmentResultDto recordRecruiterDecision(Long attemptId, RecruiterDecisionRequest request, User recruiter) {
        return reviewService.recordRecruiterDecision(attemptId, request, recruiter);
    }

    public AssessmentResultDto getAttemptResult(Long attemptId, Student student) {
        return reviewService.getAttemptResult(attemptId, student);
    }

    public AssessmentResultDto getCandidateAssessmentForRecruiter(Long opportunityId, Long studentId, User recruiter) {
        return reviewService.getCandidateAssessmentForRecruiter(opportunityId, studentId, recruiter);
    }

    public AssessmentResultDto getCandidateAssessmentByAliasForRecruiter(Long opportunityId, String candidateAlias, User recruiter) {
        return reviewService.getCandidateAssessmentByAliasForRecruiter(opportunityId, candidateAlias, recruiter);
    }

    public AssessmentDto mapToDto(Assessment assessment) {
        List<AssessmentQuestion> questions = questionRepository.findByAssessmentOrderByOrderIndexAsc(assessment);
        int maxScore = questions.stream().mapToInt(AssessmentQuestion::getPoints).sum();

        List<AssessmentDto.QuestionSummaryDto> qSummaries = questions.stream().map(q -> new AssessmentDto.QuestionSummaryDto(
                q.getId(),
                q.getQuestionType(),
                q.getDifficulty(),
                q.getSkill() != null ? q.getSkill().getName() : "General",
                q.getTitle(),
                q.getPoints()
        )).collect(Collectors.toList());

        return new AssessmentDto(
                assessment.getId(),
                assessment.getOpportunity().getId(),
                assessment.getOpportunity().getTitle(),
                assessment.getTitle(),
                assessment.getDescription(),
                assessment.getTimeLimitMinutes(),
                assessment.getPassingScore(),
                questions.size(),
                maxScore,
                qSummaries
        );
    }
}
