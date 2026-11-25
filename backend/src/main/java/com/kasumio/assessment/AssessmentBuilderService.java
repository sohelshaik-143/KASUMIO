package com.kasumio.assessment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.dto.*;
import com.kasumio.assessment.storage.StorageService;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for recruiter-driven custom assessment authoring, validation,
 * versioning snapshots, cloning, and question image asset attachments.
 */
@Service
public class AssessmentBuilderService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final CodingProblemRepository codingProblemRepository;
    private final TestCaseRepository testCaseRepository;
    private final QuestionSubmissionRepository submissionRepository;
    private final CandidateQuestionHistoryRepository candidateQuestionHistoryRepository;
    private final OpportunityRepository opportunityRepository;
    private final SkillRepository skillRepository;
    private final StorageService storageService;
    private final AssessmentValidator validator;
    private final ObjectMapper objectMapper;

    public AssessmentBuilderService(AssessmentRepository assessmentRepository,
                                    AssessmentQuestionRepository questionRepository,
                                    QuestionOptionRepository optionRepository,
                                    CodingProblemRepository codingProblemRepository,
                                    TestCaseRepository testCaseRepository,
                                    QuestionSubmissionRepository submissionRepository,
                                    CandidateQuestionHistoryRepository candidateQuestionHistoryRepository,
                                    OpportunityRepository opportunityRepository,
                                    SkillRepository skillRepository,
                                    StorageService storageService,
                                    AssessmentValidator validator,
                                    ObjectMapper objectMapper) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.codingProblemRepository = codingProblemRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;
        this.candidateQuestionHistoryRepository = candidateQuestionHistoryRepository;
        this.opportunityRepository = opportunityRepository;
        this.skillRepository = skillRepository;
        this.storageService = storageService;
        this.validator = validator;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AssessmentBuilderDto getOrCreateDraftAssessment(Long opportunityId, User recruiter) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found: " + opportunityId));
        checkRecruiterAccess(opp, recruiter);

        Assessment assessment = assessmentRepository.findFirstByOpportunityAndStatus(opp, AssessmentStatus.DRAFT)
                .or(() -> assessmentRepository.findFirstByOpportunityOrderByVersionNumberDesc(opp))
                .orElseGet(() -> {
                    Assessment draft = new Assessment(opp, "Technical Assessment: " + opp.getTitle(),
                            opp.getDescription(), 45, 70, null);
                    draft.setStatus(AssessmentStatus.DRAFT);
                    return assessmentRepository.save(draft);
                });

        if (assessment.getTotalMarks() == null || assessment.getTotalMarks() == 0) {
            recalculateTotalMarks(assessment);
        }

        return buildAssessmentDto(assessment);
    }

    @Transactional
    public AssessmentBuilderDto getAssessmentBuilder(Long assessmentId, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        if (assessment.getTotalMarks() == null || assessment.getTotalMarks() == 0) {
            recalculateTotalMarks(assessment);
        }

        return buildAssessmentDto(assessment);
    }

    @Transactional
    public QuestionBuilderDto addQuestion(Long assessmentId, AssessmentQuestionRequest req, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        // Versioning immutability guard: if assessment is published, fork a new version
        if (assessment.getStatus() == AssessmentStatus.PUBLISHED) {
            assessment = forkNewVersion(assessment);
        }

        Skill skill = null;
        if (req.getSkillName() != null && !req.getSkillName().isBlank()) {
            skill = skillRepository.findByNameIgnoreCase(req.getSkillName().trim()).orElse(null);
        }

        AssessmentQuestion question = new AssessmentQuestion(
                assessment,
                req.getQuestionType() != null ? req.getQuestionType() : QuestionType.CODING,
                req.getDifficulty() != null ? req.getDifficulty() : DifficultyLevel.MEDIUM,
                skill,
                req.getTitle() != null ? req.getTitle().trim() : "Untitled Question",
                req.getPrompt() != null ? req.getPrompt().trim() : "",
                req.getPoints() != null ? req.getPoints() : 10,
                req.getOrderIndex() != null ? req.getOrderIndex() : 0
        );

        question.setRubricJson(req.getRubricJson());
        question.setTimeLimitMinutes(req.getTimeLimitMinutes());
        if (req.getExpectedSkills() != null) {
            try {
                question.setExpectedSkillsJson(objectMapper.writeValueAsString(req.getExpectedSkills()));
            } catch (Exception ignored) {}
        }
        question.setImageUrl(req.getImageUrl());
        question.setImageAltText(req.getImageAltText());
        question.setImageCaption(req.getImageCaption());

        question = questionRepository.save(question);

        // Save options if MCQ
        if (req.getQuestionType() == QuestionType.MCQ && req.getOptions() != null) {
            saveQuestionOptions(question, req.getOptions());
        }

        // Save coding problem and test cases if code-based
        if (req.getQuestionType() != null && req.getQuestionType().isCodeBased() && req.getCodingProblem() != null) {
            saveCodingProblem(question, req.getCodingProblem());
        }

        recalculateTotalMarks(assessment);
        return buildQuestionDto(question);
    }

    @Transactional
    public QuestionBuilderDto updateQuestion(Long assessmentId, Long questionId, AssessmentQuestionRequest req, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        if (assessment.getStatus() == AssessmentStatus.PUBLISHED) {
            assessment = forkNewVersion(assessment);
            // After forking, find matching question in new assessment
            final Assessment targetAssessment = assessment;
            AssessmentQuestion original = questionRepository.findById(questionId).orElseThrow();
            AssessmentQuestion question = questionRepository.findByAssessmentOrderByOrderIndexAsc(targetAssessment)
                    .stream().filter(q -> q.getOrderIndex().equals(original.getOrderIndex()))
                    .findFirst().orElseThrow();
            return applyQuestionUpdates(question, req, targetAssessment);
        }

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
        return applyQuestionUpdates(question, req, assessment);
    }

    private QuestionBuilderDto applyQuestionUpdates(AssessmentQuestion question, AssessmentQuestionRequest req, Assessment assessment) {
        if (req.getTitle() != null) question.setTitle(req.getTitle().trim());
        if (req.getPrompt() != null) question.setPrompt(req.getPrompt().trim());
        if (req.getDifficulty() != null) question.setDifficulty(req.getDifficulty());
        if (req.getPoints() != null) question.setPoints(req.getPoints());
        if (req.getOrderIndex() != null) question.setOrderIndex(req.getOrderIndex());
        if (req.getQuestionType() != null) question.setQuestionType(req.getQuestionType());
        if (req.getRubricJson() != null) question.setRubricJson(req.getRubricJson());
        if (req.getTimeLimitMinutes() != null) question.setTimeLimitMinutes(req.getTimeLimitMinutes());
        if (req.getImageUrl() != null) question.setImageUrl(req.getImageUrl());
        if (req.getImageAltText() != null) question.setImageAltText(req.getImageAltText());
        if (req.getImageCaption() != null) question.setImageCaption(req.getImageCaption());

        if (req.getSkillName() != null) {
            Skill skill = skillRepository.findByNameIgnoreCase(req.getSkillName().trim()).orElse(null);
            question.setSkill(skill);
        }
        if (req.getExpectedSkills() != null) {
            try {
                question.setExpectedSkillsJson(objectMapper.writeValueAsString(req.getExpectedSkills()));
            } catch (Exception ignored) {}
        }

        question = questionRepository.save(question);

        if (req.getOptions() != null) {
            optionRepository.deleteByQuestion(question);
            saveQuestionOptions(question, req.getOptions());
        }

        if (req.getCodingProblem() != null) {
            codingProblemRepository.findByQuestion(question).ifPresent(cp -> {
                testCaseRepository.deleteByCodingProblem(cp);
                codingProblemRepository.delete(cp);
            });
            saveCodingProblem(question, req.getCodingProblem());
        }

        recalculateTotalMarks(assessment);
        return buildQuestionDto(question);
    }

    @Transactional
    public void deleteQuestion(Long assessmentId, Long questionId, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        if (assessment.getStatus() == AssessmentStatus.PUBLISHED) {
            assessment = forkNewVersion(assessment);
        }

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        if (question.getImageStorageKey() != null) {
            try {
                storageService.delete(question.getImageStorageKey());
            } catch (Exception ignored) {}
        }

        // Clean up child coding problems and test cases
        codingProblemRepository.findByQuestion(question).ifPresent(cp -> {
            testCaseRepository.deleteByCodingProblem(cp);
            codingProblemRepository.delete(cp);
        });

        // Clean up question options
        optionRepository.deleteByQuestion(question);

        // Clean up any candidate submissions or history referencing this question
        try {
            submissionRepository.deleteByQuestion(question);
        } catch (Exception ignored) {}

        try {
            candidateQuestionHistoryRepository.deleteByQuestion(question);
        } catch (Exception ignored) {}

        questionRepository.delete(question);
        recalculateTotalMarks(assessment);
    }

    @Transactional
    public AssessmentValidationResultDto validateAssessment(Long assessmentId, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        List<AssessmentQuestion> questions = questionRepository.findByAssessmentOrderByOrderIndexAsc(assessment);
        List<QuestionOption> options = new ArrayList<>();
        List<CodingProblem> codingProblems = new ArrayList<>();
        List<TestCase> testCases = new ArrayList<>();

        for (AssessmentQuestion q : questions) {
            options.addAll(optionRepository.findByQuestionOrderByOrderIndexAsc(q));
            codingProblemRepository.findByQuestion(q).ifPresent(cp -> {
                codingProblems.add(cp);
                testCases.addAll(testCaseRepository.findByCodingProblemOrderByOrderIndexAsc(cp));
            });
        }

        Map<String, Integer> skillWeightings = parseSkillWeightings(assessment.getSkillWeightingsJson());
        return validator.validate(assessment, questions, options, codingProblems, testCases, skillWeightings);
    }

    @Transactional
    public AssessmentBuilderDto publishAssessment(Long assessmentId, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        AssessmentValidationResultDto validation = validateAssessment(assessmentId, recruiter);
        if (!validation.isValid()) {
            throw new IllegalStateException("Cannot publish invalid assessment: " + String.join("; ", validation.errors()));
        }

        assessment.setStatus(AssessmentStatus.PUBLISHED);
        assessment.setTotalMarks(validation.totalMarks());
        assessment = assessmentRepository.save(assessment);
        return buildAssessmentDto(assessment);
    }

    @Transactional
    public AssessmentBuilderDto cloneAssessment(Long sourceAssessmentId, Long targetOpportunityId, User recruiter) {
        Assessment source = assessmentRepository.findById(sourceAssessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + sourceAssessmentId));
        checkRecruiterAccess(source.getOpportunity(), recruiter);

        Opportunity targetOpp = opportunityRepository.findById(targetOpportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Target opportunity not found: " + targetOpportunityId));
        checkRecruiterAccess(targetOpp, recruiter);

        Assessment clone = new Assessment(
                targetOpp,
                source.getTitle() + " (Copy)",
                source.getDescription(),
                source.getTimeLimitMinutes(),
                source.getPassingScore(),
                source.getBlueprintJson()
        );
        clone.setStatus(AssessmentStatus.DRAFT);
        clone.setVersionNumber(1);
        clone.setSkillWeightingsJson(source.getSkillWeightingsJson());
        clone = assessmentRepository.save(clone);

        List<AssessmentQuestion> sourceQuestions = questionRepository.findByAssessmentOrderByOrderIndexAsc(source);
        for (AssessmentQuestion sq : sourceQuestions) {
            AssessmentQuestion nq = new AssessmentQuestion(
                    clone, sq.getQuestionType(), sq.getDifficulty(), sq.getSkill(),
                    sq.getTitle(), sq.getPrompt(), sq.getPoints(), sq.getOrderIndex()
            );
            nq.setRubricJson(sq.getRubricJson());
            nq.setTimeLimitMinutes(sq.getTimeLimitMinutes());
            nq.setExpectedSkillsJson(sq.getExpectedSkillsJson());
            nq.setImageAltText(sq.getImageAltText());
            nq.setImageCaption(sq.getImageCaption());

            // Clone image safely if present
            if (sq.getImageStorageKey() != null) {
                String newKey = storageService.copy(sq.getImageStorageKey());
                if (newKey != null) {
                    nq.setImageStorageKey(newKey);
                    nq.setImageUrl("/api/assessments/images/" + newKey);
                }
            }

            nq = questionRepository.save(nq);

            // Clone options
            List<QuestionOption> options = optionRepository.findByQuestionOrderByOrderIndexAsc(sq);
            for (QuestionOption opt : options) {
                QuestionOption nOpt = new QuestionOption(nq, opt.getOptionText(), opt.isCorrect(), opt.getExplanation(), opt.getOrderIndex());
                optionRepository.save(nOpt);
            }

            // Clone coding problem
            Optional<CodingProblem> cpOpt = codingProblemRepository.findByQuestion(sq);
            if (cpOpt.isPresent()) {
                CodingProblem cp = cpOpt.get();
                CodingProblem nCp = new CodingProblem(nq, cp.getProblemStatement(), cp.getStarterCodeJson(),
                        cp.getConstraints(), cp.getAllowedLanguages(), cp.getTimeLimitMs(), cp.getMemoryLimitMb());
                nCp = codingProblemRepository.save(nCp);

                List<TestCase> testCases = testCaseRepository.findByCodingProblemOrderByOrderIndexAsc(cp);
                for (TestCase tc : testCases) {
                    TestCase nTc = new TestCase(nCp, tc.getInputData(), tc.getExpectedOutput(), tc.isHidden(), tc.getExplanation(), tc.getOrderIndex());
                    testCaseRepository.save(nTc);
                }
            }
        }

        recalculateTotalMarks(clone);
        return buildAssessmentDto(clone);
    }

    @Transactional
    public String uploadQuestionImage(Long assessmentId, Long questionId, InputStream imageStream,
                                      String filename, String contentType, long size,
                                      String altText, String caption, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        if (altText == null || altText.trim().isEmpty()) {
            throw new IllegalArgumentException("Image alt text is required for accessibility.");
        }

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        // Delete old image if existed
        if (question.getImageStorageKey() != null) {
            storageService.delete(question.getImageStorageKey());
        }

        String storageKey = storageService.store(imageStream, filename, contentType, size);
        String imageUrl = "/api/assessments/images/" + storageKey;

        question.setImageStorageKey(storageKey);
        question.setImageUrl(imageUrl);
        question.setImageAltText(altText.trim());
        question.setImageCaption(caption != null ? caption.trim() : null);
        questionRepository.save(question);

        return imageUrl;
    }

    @Transactional
    public void deleteQuestionImage(Long assessmentId, Long questionId, User recruiter) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + assessmentId));
        checkRecruiterAccess(assessment.getOpportunity(), recruiter);

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        if (question.getImageStorageKey() != null) {
            storageService.delete(question.getImageStorageKey());
            question.setImageStorageKey(null);
            question.setImageUrl(null);
            question.setImageAltText(null);
            question.setImageCaption(null);
            questionRepository.save(question);
        }
    }

    private Assessment forkNewVersion(Assessment current) {
        Assessment newVersion = new Assessment(
                current.getOpportunity(),
                current.getTitle(),
                current.getDescription(),
                current.getTimeLimitMinutes(),
                current.getPassingScore(),
                current.getBlueprintJson()
        );
        newVersion.setStatus(AssessmentStatus.DRAFT);
        newVersion.setVersionNumber(current.getVersionNumber() + 1);
        newVersion.setSkillWeightingsJson(current.getSkillWeightingsJson());
        newVersion = assessmentRepository.save(newVersion);

        // Copy questions from current version
        List<AssessmentQuestion> oldQuestions = questionRepository.findByAssessmentOrderByOrderIndexAsc(current);
        for (AssessmentQuestion oq : oldQuestions) {
            AssessmentQuestion nq = new AssessmentQuestion(
                    newVersion, oq.getQuestionType(), oq.getDifficulty(), oq.getSkill(),
                    oq.getTitle(), oq.getPrompt(), oq.getPoints(), oq.getOrderIndex()
            );
            nq.setRubricJson(oq.getRubricJson());
            nq.setTimeLimitMinutes(oq.getTimeLimitMinutes());
            nq.setExpectedSkillsJson(oq.getExpectedSkillsJson());
            nq.setImageAltText(oq.getImageAltText());
            nq.setImageCaption(oq.getImageCaption());
            if (oq.getImageStorageKey() != null) {
                String copyKey = storageService.copy(oq.getImageStorageKey());
                nq.setImageStorageKey(copyKey);
                nq.setImageUrl("/api/assessments/images/" + copyKey);
            }
            nq = questionRepository.save(nq);

            List<QuestionOption> options = optionRepository.findByQuestionOrderByOrderIndexAsc(oq);
            for (QuestionOption opt : options) {
                optionRepository.save(new QuestionOption(nq, opt.getOptionText(), opt.isCorrect(), opt.getExplanation(), opt.getOrderIndex()));
            }

            Optional<CodingProblem> cpOpt = codingProblemRepository.findByQuestion(oq);
            if (cpOpt.isPresent()) {
                CodingProblem cp = cpOpt.get();
                CodingProblem nCp = codingProblemRepository.save(new CodingProblem(nq, cp.getProblemStatement(), cp.getStarterCodeJson(),
                        cp.getConstraints(), cp.getAllowedLanguages(), cp.getTimeLimitMs(), cp.getMemoryLimitMb()));
                List<TestCase> tcs = testCaseRepository.findByCodingProblemOrderByOrderIndexAsc(cp);
                for (TestCase tc : tcs) {
                    testCaseRepository.save(new TestCase(nCp, tc.getInputData(), tc.getExpectedOutput(), tc.isHidden(), tc.getExplanation(), tc.getOrderIndex()));
                }
            }
        }
        recalculateTotalMarks(newVersion);
        return newVersion;
    }

    private void recalculateTotalMarks(Assessment assessment) {
        List<AssessmentQuestion> questions = questionRepository.findByAssessmentOrderByOrderIndexAsc(assessment);
        int total = questions.stream().mapToInt(AssessmentQuestion::getPoints).sum();
        assessment.setTotalMarks(total);
        assessmentRepository.save(assessment);
    }

    private void saveQuestionOptions(AssessmentQuestion question, List<QuestionBuilderDto.OptionSpec> options) {
        int idx = 0;
        for (QuestionBuilderDto.OptionSpec o : options) {
            QuestionOption opt = new QuestionOption(question, o.text(), o.isCorrect(), o.explanation(), idx++);
            optionRepository.save(opt);
        }
    }

    private void saveCodingProblem(AssessmentQuestion question, QuestionBuilderDto.CodingProblemSpec cpSpec) {
        String starterJson = "{}";
        try {
            if (cpSpec.starterCodeByLang() != null) {
                starterJson = objectMapper.writeValueAsString(cpSpec.starterCodeByLang());
            }
        } catch (Exception ignored) {}

        CodingProblem cp = new CodingProblem(
                question,
                cpSpec.problemStatement() != null ? cpSpec.problemStatement() : question.getPrompt(),
                starterJson,
                cpSpec.constraints(),
                cpSpec.allowedLanguages() != null ? cpSpec.allowedLanguages() : "java,python,javascript,sql",
                4000,
                256
        );
        cp = codingProblemRepository.save(cp);

        if (cpSpec.testCases() != null) {
            int tcIdx = 0;
            for (QuestionBuilderDto.TestCaseSpec tc : cpSpec.testCases()) {
                TestCase testCase = new TestCase(cp, tc.inputData(), tc.expectedOutput(), tc.isHidden(), tc.explanation(), tcIdx++);
                testCaseRepository.save(testCase);
            }
        }
    }

    private void checkRecruiterAccess(Opportunity opp, User recruiter) {
        if (recruiter.getRole() == Role.ADMIN) return;
        if (opp.getRecruiter() == null || !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to manage assessments for this opportunity.");
        }
    }

    private Map<String, Integer> parseSkillWeightings(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private AssessmentBuilderDto buildAssessmentDto(Assessment assessment) {
        List<AssessmentQuestion> questions = questionRepository.findByAssessmentOrderByOrderIndexAsc(assessment);
        List<QuestionBuilderDto> qDtos = questions.stream().map(this::buildQuestionDto).collect(Collectors.toList());

        return new AssessmentBuilderDto(
                assessment.getId(),
                assessment.getOpportunity().getId(),
                assessment.getOpportunity().getTitle(),
                assessment.getTitle(),
                assessment.getDescription(),
                assessment.getTimeLimitMinutes(),
                assessment.getPassingScore(),
                assessment.getStatus(),
                assessment.getVersionNumber(),
                assessment.getTotalMarks(),
                parseSkillWeightings(assessment.getSkillWeightingsJson()),
                assessment.getPassingCriteria(),
                qDtos
        );
    }

    private QuestionBuilderDto buildQuestionDto(AssessmentQuestion q) {
        List<QuestionBuilderDto.OptionSpec> options = optionRepository.findByQuestionOrderByOrderIndexAsc(q).stream()
                .map(o -> new QuestionBuilderDto.OptionSpec(o.getId(), o.getOptionText(), o.isCorrect(), o.getExplanation(), o.getOrderIndex()))
                .collect(Collectors.toList());

        QuestionBuilderDto.CodingProblemSpec cpSpec = codingProblemRepository.findByQuestion(q).map(cp -> {
            Map<String, String> starters = new HashMap<>();
            try {
                starters = objectMapper.readValue(cp.getStarterCodeJson(), new TypeReference<Map<String, String>>() {});
            } catch (Exception ignored) {}

            List<QuestionBuilderDto.TestCaseSpec> testCases = testCaseRepository.findByCodingProblemOrderByOrderIndexAsc(cp).stream()
                    .map(tc -> new QuestionBuilderDto.TestCaseSpec(tc.getId(), tc.getInputData(), tc.getExpectedOutput(), tc.isHidden(), tc.getExplanation()))
                    .collect(Collectors.toList());

            return new QuestionBuilderDto.CodingProblemSpec(
                    cp.getProblemStatement(),
                    cp.getConstraints(),
                    cp.getAllowedLanguages(),
                    starters,
                    testCases
            );
        }).orElse(null);

        List<String> expectedSkills = new ArrayList<>();
        if (q.getExpectedSkillsJson() != null) {
            try {
                expectedSkills = objectMapper.readValue(q.getExpectedSkillsJson(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        return new QuestionBuilderDto(
                q.getId(),
                q.getQuestionType(),
                q.getDifficulty(),
                q.getSkill() != null ? q.getSkill().getName() : null,
                q.getTitle(),
                q.getPrompt(),
                q.getPoints(),
                q.getOrderIndex(),
                q.getRubricJson(),
                q.getTimeLimitMinutes(),
                expectedSkills,
                q.getImageUrl(),
                q.getImageAltText(),
                q.getImageCaption(),
                options,
                cpSpec
        );
    }
}
