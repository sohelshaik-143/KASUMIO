package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.dto.AssessmentAttemptDto;
import com.kasumio.assessment.dto.QuestionDetailDto;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Maps Assessment questions and attempts to client transfer objects.
 */
@Component
public class AssessmentQuestionMapper {

    private final QuestionOptionRepository optionRepository;
    private final CodingProblemRepository codingProblemRepository;
    private final TestCaseRepository testCaseRepository;
    private final ObjectMapper objectMapper;

    public AssessmentQuestionMapper(QuestionOptionRepository optionRepository,
                                  CodingProblemRepository codingProblemRepository,
                                  TestCaseRepository testCaseRepository,
                                  ObjectMapper objectMapper) {
        this.optionRepository = optionRepository;
        this.codingProblemRepository = codingProblemRepository;
        this.testCaseRepository = testCaseRepository;
        this.objectMapper = objectMapper;
    }

    public AssessmentAttemptDto mapAttemptToDto(AssessmentAttempt a) {
        AssessmentAttemptDto dto = new AssessmentAttemptDto(
                a.getId(),
                a.getAssessment().getId(),
                a.getAssessment().getTitle(),
                a.getAssessment().getOpportunity().getId(),
                a.getAssessment().getOpportunity().getTitle(),
                a.getStudent().getId(),
                a.getStudent().getFullName(),
                a.getStatus(),
                a.getScore(),
                a.getMaxScore(),
                a.getAdaptiveDifficulty(),
                a.getAssessment().getTimeLimitMinutes(),
                a.getStartedAt(),
                a.getCompletedAt()
        );
        dto.setSelfAssessmentLevel(a.getSelfAssessmentLevel() != null ? a.getSelfAssessmentLevel().name() : "MEDIUM");
        dto.setDemonstratedLevel(a.getDemonstratedLevel() != null ? a.getDemonstratedLevel().name() : "MEDIUM");
        dto.setIntegrityStatus(a.getIntegrityStatus() != null ? a.getIntegrityStatus().name() : "NORMAL");
        return dto;
    }

    public QuestionDetailDto mapQuestionToDetailDto(AssessmentQuestion q) {
        List<QuestionOption> options = optionRepository.findByQuestionOrderByOrderIndexAsc(q);
        List<QuestionDetailDto.CandidateOptionDto> optionDtos = options.stream()
                .map(o -> new QuestionDetailDto.CandidateOptionDto(o.getId(), o.getOptionText()))
                .collect(Collectors.toList());

        QuestionDetailDto.CandidateCodingProblemDto codingDto = null;
        Optional<CodingProblem> cpOpt = codingProblemRepository.findByQuestion(q);
        if (cpOpt.isPresent()) {
            CodingProblem cp = cpOpt.get();
            Map<String, String> starterCode = Collections.emptyMap();
            try {
                starterCode = objectMapper.readValue(cp.getStarterCodeJson(), Map.class);
            } catch (Exception ignored) {}

            List<TestCase> sampleCases = testCaseRepository.findByCodingProblemIdAndIsHiddenFalseOrderByOrderIndexAsc(cp.getId());
            List<QuestionDetailDto.CandidateSampleTestCaseDto> sampleDtos = sampleCases.stream()
                    .map(tc -> new QuestionDetailDto.CandidateSampleTestCaseDto(tc.getId(), tc.getInputData(), tc.getExpectedOutput(), tc.getExplanation()))
                    .collect(Collectors.toList());

            List<String> langs = Arrays.asList(cp.getAllowedLanguages().split(","));
            codingDto = new QuestionDetailDto.CandidateCodingProblemDto(
                    cp.getId(),
                    cp.getProblemStatement(),
                    starterCode,
                    cp.getConstraints(),
                    langs,
                    cp.getTimeLimitMs(),
                    sampleDtos
            );
        }

        QuestionDetailDto dto = new QuestionDetailDto(
                q.getId(),
                q.getAssessment().getId(),
                q.getQuestionType(),
                q.getDifficulty(),
                q.getSkill() != null ? q.getSkill().getName() : "General",
                q.getTitle(),
                q.getPrompt(),
                q.getPoints(),
                q.getOrderIndex(),
                optionDtos,
                codingDto
        );
        dto.setCompetencyArea(q.getCompetencyArea());
        dto.setValidationStatus(q.getValidationStatus());
        dto.setImageUrl(q.getImageUrl());
        dto.setImageAltText(q.getImageAltText());
        dto.setImageCaption(q.getImageCaption());
        return dto;
    }
}
