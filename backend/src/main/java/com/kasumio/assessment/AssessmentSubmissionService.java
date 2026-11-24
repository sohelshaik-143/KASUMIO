package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.dto.*;
import com.kasumio.student.Student;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service managing individual question submissions and code runs during an assessment.
 */
@Service
public class AssessmentSubmissionService {

    private final AssessmentQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final CodingProblemRepository codingProblemRepository;
    private final TestCaseRepository testCaseRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final QuestionSubmissionRepository submissionRepository;
    private final DeterministicEvaluationService evaluationService;
    private final AdaptiveAssessmentEngine adaptiveEngine;
    private final CodeQualityAndComplexityAnalyzer codeAnalyzer;
    private final ObjectMapper objectMapper;

    public AssessmentSubmissionService(AssessmentQuestionRepository questionRepository,
                                       QuestionOptionRepository optionRepository,
                                       CodingProblemRepository codingProblemRepository,
                                       TestCaseRepository testCaseRepository,
                                       AssessmentAttemptRepository attemptRepository,
                                       QuestionSubmissionRepository submissionRepository,
                                       DeterministicEvaluationService evaluationService,
                                       AdaptiveAssessmentEngine adaptiveEngine,
                                       CodeQualityAndComplexityAnalyzer codeAnalyzer,
                                       ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.codingProblemRepository = codingProblemRepository;
        this.testCaseRepository = testCaseRepository;
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationService = evaluationService;
        this.adaptiveEngine = adaptiveEngine;
        this.codeAnalyzer = codeAnalyzer;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public RunCodeResponse runCode(Long attemptId, Long questionId, RunCodeRequest request, Student student) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied to attempt.");
        }

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        CodingProblem problem = codingProblemRepository.findByQuestion(question)
                .orElseThrow(() -> new IllegalArgumentException("Not a coding question: " + questionId));

        List<TestCase> sampleCases = testCaseRepository.findByCodingProblemIdAndIsHiddenFalseOrderByOrderIndexAsc(problem.getId());

        DeterministicEvaluationService.EvaluationOutcome outcome = evaluationService.evaluateCoding(
                problem, sampleCases, request.getLanguage(), request.getCode()
        );

        String sampleStdout = outcome.getTestCaseResults().isEmpty() ? "" : outcome.getTestCaseResults().get(0).getActualOutput();
        String sampleStderr = outcome.getCompilationOutput();

        RunCodeResponse resp = new RunCodeResponse(
                outcome.getStatus() == SubmissionStatus.PASSED,
                outcome.getStatus() == SubmissionStatus.ERROR,
                outcome.getCompilationOutput(),
                sampleStdout,
                sampleStderr,
                outcome.getExecutionTimeMs(),
                outcome.getMemoryUsedKb(),
                outcome.getStatus() == SubmissionStatus.TIMEOUT,
                outcome.getTestCaseResults()
        );
        if (outcome.getCompilationOutput() != null && outcome.getCompilationOutput().contains("disabled")) {
            resp.setExecutionUnavailable(true);
        }
        return resp;
    }

    @Transactional
    public SubmitQuestionResponse submitQuestion(Long attemptId, SubmitQuestionRequest request, Student student) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied to attempt.");
        }

        AssessmentQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + request.getQuestionId()));

        DeterministicEvaluationService.EvaluationOutcome outcome;
        QuestionOption selectedOption = null;

        if (question.getQuestionType() == QuestionType.CODING) {
            CodingProblem problem = codingProblemRepository.findByQuestion(question)
                    .orElseThrow(() -> new IllegalArgumentException("Problem not found for question: " + question.getId()));
            List<TestCase> allTestCases = testCaseRepository.findByCodingProblemOrderByOrderIndexAsc(problem);
            outcome = evaluationService.evaluateCoding(problem, allTestCases, request.getLanguage(), request.getCode());
        } else {
            if (request.getSelectedOptionId() != null) {
                selectedOption = optionRepository.findById(request.getSelectedOptionId()).orElse(null);
            }
            outcome = evaluationService.evaluateOption(question, selectedOption);
        }

        int pointsEarned = 0;
        if (question.getQuestionType() == QuestionType.CODING) {
            if (outcome.getTotalTestCases() > 0) {
                double ratio = (double) outcome.getTestCasesPassed() / outcome.getTotalTestCases();
                pointsEarned = (int) Math.round(ratio * question.getPoints());
            }
        } else {
            if (outcome.getStatus() == SubmissionStatus.PASSED) {
                pointsEarned = question.getPoints();
            }
        }

        String codeAnalysisJson = null;
        Double similarityScore = 0.0;
        if (question.getQuestionType() == QuestionType.CODING && request.getCode() != null) {
            CodingProblem problem = codingProblemRepository.findByQuestion(question).orElse(null);
            String starterOrRef = problem != null ? problem.getStarterCodeJson() : "";
            CodeQualityAndComplexityAnalyzer.CodeAnalysisResult analysis =
                    codeAnalyzer.analyze(request.getCode(), request.getLanguage(), starterOrRef);
            try {
                codeAnalysisJson = objectMapper.writeValueAsString(analysis);
            } catch (Exception ignored) {}
            similarityScore = analysis.structuralSimilarity;
        }

        Map<String, Object> telemetryMap = new HashMap<>();
        telemetryMap.put("focusChangeCount", request.getFocusChangeCount() != null ? request.getFocusChangeCount() : 0);
        telemetryMap.put("pasteCount", request.getPasteCount() != null ? request.getPasteCount() : 0);
        telemetryMap.put("keystrokeCount", request.getKeystrokeCount() != null ? request.getKeystrokeCount() : 0);
        telemetryMap.put("largeChangesCount", request.getLargeChangesCount() != null ? request.getLargeChangesCount() : 0);
        telemetryMap.put("timeSpentSeconds", request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 0L);
        String telemetryJson = null;
        try {
            telemetryJson = objectMapper.writeValueAsString(telemetryMap);
        } catch (Exception ignored) {}

        QuestionSubmission submission = new QuestionSubmission(
                attempt,
                question,
                request.getLanguage(),
                request.getCode(),
                selectedOption,
                outcome.getStatus(),
                outcome.getExecutionTimeMs(),
                outcome.getMemoryUsedKb(),
                outcome.getTestCasesPassed(),
                outcome.getTotalTestCases(),
                evaluationService.serializeFeedback(outcome.getFeedback())
        );
        submission.setTelemetryJson(telemetryJson);
        submission.setCodeAnalysisJson(codeAnalysisJson);
        submission.setSimilarityScore(similarityScore);
        submission = submissionRepository.save(submission);

        attempt.setScore(attempt.getScore() + pointsEarned);
        DifficultyLevel nextDiff = adaptiveEngine.determineNextDifficulty(
                attempt.getAdaptiveDifficulty(), outcome.getStatus() == SubmissionStatus.PASSED
        );
        attempt.setAdaptiveDifficulty(nextDiff);
        attemptRepository.save(attempt);

        List<AssessmentQuestion> allQuestions = questionRepository.findByAssessmentOrderByOrderIndexAsc(attempt.getAssessment());
        List<QuestionSubmission> submissions = submissionRepository.findByAttemptOrderByCreatedAtAsc(attempt);
        List<Long> answeredIds = submissions.stream().map(s -> s.getQuestion().getId()).collect(Collectors.toList());

        boolean hasNext = allQuestions.stream().anyMatch(q -> !answeredIds.contains(q.getId()));

        return new SubmitQuestionResponse(
                submission.getId(),
                outcome.getStatus(),
                pointsEarned,
                question.getPoints(),
                attempt.getScore(),
                nextDiff,
                hasNext,
                outcome.getFeedback()
        );
    }

    @Transactional
    public void recordTelemetry(Long attemptId, TelemetryIngestRequest req, Student student) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied to attempt.");
        }

        try {
            Map<String, Object> current = new HashMap<>();
            if (attempt.getIntegritySignalsJson() != null) {
                try {
                    current = objectMapper.readValue(attempt.getIntegritySignalsJson(), Map.class);
                } catch (Exception ignored) {}
            }
            current.put("lastActiveQuestionId", req.getQuestionId());
            current.put("focusChanges", ((Number) current.getOrDefault("focusChanges", 0)).intValue() + (req.getFocusChangeCount() != null ? req.getFocusChangeCount() : 0));
            current.put("pastes", ((Number) current.getOrDefault("pastes", 0)).intValue() + (req.getPasteCount() != null ? req.getPasteCount() : 0));
            current.put("keystrokes", ((Number) current.getOrDefault("keystrokes", 0)).intValue() + (req.getKeystrokeCount() != null ? req.getKeystrokeCount() : 0));
            current.put("largeChanges", ((Number) current.getOrDefault("largeChanges", 0)).intValue() + (req.getLargeChangesCount() != null ? req.getLargeChangesCount() : 0));
            current.put("timeSpentSeconds", ((Number) current.getOrDefault("timeSpentSeconds", 0L)).longValue() + (req.getTimeSpentSeconds() != null ? req.getTimeSpentSeconds() : 0L));
            attempt.setIntegritySignalsJson(objectMapper.writeValueAsString(current));
            attemptRepository.save(attempt);
        } catch (Exception ignored) {}
    }
}
