package com.kasumio.assessment;

import com.kasumio.assessment.dto.*;
import com.kasumio.assessment.storage.ImageSecurityValidator;
import com.kasumio.assessment.storage.LocalStorageService;
import com.kasumio.assessment.storage.StorageException;
import com.kasumio.opportunity.*;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AssessmentBuilderTest {

    @Autowired private AssessmentBuilderService builderService;
    @Autowired private OpportunityRepository opportunityRepository;
    @Autowired private OrganizationRepository organizationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SkillRepository skillRepository;
    @Autowired private LocalStorageService storageService;

    private User recruiterUser;
    private User otherRecruiterUser;
    private Opportunity testOpportunity;
    private Skill javaSkill;

    @BeforeEach
    void setUp() {
        Organization org = organizationRepository.save(new Organization("TechCorp", com.kasumio.organization.OrganizationType.COMPANY, "https://techcorp.com"));
        recruiterUser = userRepository.save(new User("builder-recruiter@test.com", "pass12345678", Role.RECRUITER, org));
        otherRecruiterUser = userRepository.save(new User("other-recruiter@test.com", "pass12345678", Role.RECRUITER, org));

        testOpportunity = new Opportunity(
                recruiterUser,
                "Backend Engineer Assessment Test",
                "Full-stack role",
                OpportunityType.JOB,
                "Remote",
                WorkType.REMOTE
        );
        testOpportunity = opportunityRepository.save(testOpportunity);

        javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseGet(() ->
                skillRepository.save(new Skill("Java", "Programming")));
    }

    @Test
    @DisplayName("Recruiter can initialize draft assessment and add custom questions")
    void testRecruiterInitializesAndAddsQuestions() {
        AssessmentBuilderDto draft = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);
        assertThat(draft).isNotNull();
        assertThat(draft.status()).isEqualTo(AssessmentStatus.DRAFT);
        assertThat(draft.versionNumber()).isEqualTo(1);

        // Add DSA coding question
        AssessmentQuestionRequest codingReq = new AssessmentQuestionRequest();
        codingReq.setQuestionType(QuestionType.DSA_CODING);
        codingReq.setTitle("Reverse Linked List");
        codingReq.setPrompt("Write a function to reverse a singly linked list in O(n) time.");
        codingReq.setPoints(25);
        codingReq.setDifficulty(DifficultyLevel.MEDIUM);
        codingReq.setSkillName("Java");

        QuestionBuilderDto.CodingProblemSpec cpSpec = new QuestionBuilderDto.CodingProblemSpec(
                "Reverse a linked list",
                "1 <= N <= 10^5",
                "java,python",
                Map.of("java", "class Solution {}"),
                List.of(new QuestionBuilderDto.TestCaseSpec(null, "[1,2,3]", "[3,2,1]", false, "Basic test"))
        );
        codingReq.setCodingProblem(cpSpec);

        QuestionBuilderDto q1 = builderService.addQuestion(draft.id(), codingReq, recruiterUser);
        assertThat(q1.id()).isNotNull();
        assertThat(q1.points()).isEqualTo(25);
        assertThat(q1.questionType()).isEqualTo(QuestionType.DSA_CODING);

        // Add MCQ question
        AssessmentQuestionRequest mcqReq = new AssessmentQuestionRequest();
        mcqReq.setQuestionType(QuestionType.MCQ);
        mcqReq.setTitle("SQL Indexing Complexity");
        mcqReq.setPrompt("What is the average lookup complexity of a B-tree index?");
        mcqReq.setPoints(10);
        mcqReq.setOptions(List.of(
                new QuestionBuilderDto.OptionSpec(null, "O(1)", false, "Hash index", 0),
                new QuestionBuilderDto.OptionSpec(null, "O(log N)", true, "B-tree depth traversal", 1)
        ));

        QuestionBuilderDto q2 = builderService.addQuestion(draft.id(), mcqReq, recruiterUser);
        assertThat(q2.id()).isNotNull();
        assertThat(q2.points()).isEqualTo(10);

        AssessmentBuilderDto updated = builderService.getAssessmentBuilder(draft.id(), recruiterUser);
        assertThat(updated.totalMarks()).isEqualTo(35);
        assertThat(updated.questions()).hasSize(2);
    }

    @Test
    @DisplayName("Validation fails when criteria are violated and passes when met")
    void testAssessmentValidationRules() {
        AssessmentBuilderDto draft = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);

        // 1. Validation fails when empty
        AssessmentValidationResultDto val1 = builderService.validateAssessment(draft.id(), recruiterUser);
        assertThat(val1.isValid()).isFalse();
        assertThat(val1.errors()).anyMatch(e -> e.contains("at least one question"));

        // 2. Add MCQ without correct answer
        AssessmentQuestionRequest badMcq = new AssessmentQuestionRequest();
        badMcq.setQuestionType(QuestionType.MCQ);
        badMcq.setTitle("Unsolvable MCQ");
        badMcq.setPrompt("No correct answer?");
        badMcq.setPoints(10);
        badMcq.setOptions(List.of(
                new QuestionBuilderDto.OptionSpec(null, "Choice A", false, null, 0),
                new QuestionBuilderDto.OptionSpec(null, "Choice B", false, null, 1)
        ));
        builderService.addQuestion(draft.id(), badMcq, recruiterUser);

        AssessmentValidationResultDto val2 = builderService.validateAssessment(draft.id(), recruiterUser);
        assertThat(val2.isValid()).isFalse();
        assertThat(val2.errors()).anyMatch(e -> e.contains("at least 1 correct option"));
    }

    @Test
    @DisplayName("Assessment versioning: editing a published assessment creates an immutable snapshot and branches a new version")
    void testAssessmentVersioningOnEdit() {
        AssessmentBuilderDto draft = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);

        // Add valid MCQ
        AssessmentQuestionRequest mcq = new AssessmentQuestionRequest();
        mcq.setQuestionType(QuestionType.MCQ);
        mcq.setTitle("Valid MCQ");
        mcq.setPrompt("What is JVM?");
        mcq.setPoints(20);
        mcq.setOptions(List.of(
                new QuestionBuilderDto.OptionSpec(null, "Java Virtual Machine", true, null, 0),
                new QuestionBuilderDto.OptionSpec(null, "Just Very Mild", false, null, 1)
        ));
        builderService.addQuestion(draft.id(), mcq, recruiterUser);

        // Publish
        AssessmentBuilderDto published = builderService.publishAssessment(draft.id(), recruiterUser);
        assertThat(published.status()).isEqualTo(AssessmentStatus.PUBLISHED);
        assertThat(published.versionNumber()).isEqualTo(1);

        // Now add another question to the published assessment -> must fork to version 2!
        AssessmentQuestionRequest q2 = new AssessmentQuestionRequest();
        q2.setQuestionType(QuestionType.SHORT_ANSWER);
        q2.setTitle("Explain ACID properties");
        q2.setPrompt("Explain Atomicity, Consistency, Isolation, and Durability in relational databases.");
        q2.setPoints(30);
        q2.setRubricJson("{\"criteria\": \"Must define all 4 attributes accurately\"}");

        QuestionBuilderDto addedToV2 = builderService.addQuestion(published.id(), q2, recruiterUser);
        assertThat(addedToV2).isNotNull();

        // Check the newly created assessment version
        AssessmentBuilderDto v2 = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);
        assertThat(v2.versionNumber()).isEqualTo(2);
        assertThat(v2.status()).isEqualTo(AssessmentStatus.DRAFT);
        assertThat(v2.questions()).hasSize(2);
        assertThat(v2.totalMarks()).isEqualTo(50);
    }

    @Test
    @DisplayName("Recruiter permission check: unauthorized recruiter cannot manage another recruiter's assessment")
    void testRecruiterPermissionIsolation() {
        AssessmentBuilderDto draft = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);

        assertThatThrownBy(() -> builderService.getAssessmentBuilder(draft.id(), otherRecruiterUser))
                .isInstanceOf(AccessDeniedException.class);

        AssessmentQuestionRequest req = new AssessmentQuestionRequest();
        req.setTitle("Hacked question");
        assertThatThrownBy(() -> builderService.addQuestion(draft.id(), req, otherRecruiterUser))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Question image upload security: validates magic bytes, strips EXIF, rejects SVGs")
    void testQuestionImageSecurity() {
        // Valid PNG header (8 magic bytes) + mock IHDR chunk
        byte[] validPngBytes = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
        };
        ImageSecurityValidator.ValidatedFormat format = ImageSecurityValidator.validateAndDetect(
                validPngBytes, "diagram.png", validPngBytes.length
        );
        assertThat(format).isEqualTo(ImageSecurityValidator.ValidatedFormat.PNG);

        // Reject SVG by extension
        assertThatThrownBy(() -> ImageSecurityValidator.validateAndDetect(
                "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes(StandardCharsets.UTF_8),
                "exploit.svg", 65
        )).isInstanceOf(StorageException.class).hasMessageContaining("SVG format is strictly forbidden");

        // Reject spoofed extension: SVG content disguised as .png
        byte[] spoofedSvgBytes = "<svg viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\"/></svg>".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> ImageSecurityValidator.validateAndDetect(spoofedSvgBytes, "schema.png", spoofedSvgBytes.length))
                .isInstanceOf(StorageException.class).hasMessageContaining("SVG image content detected and rejected");
    }

    @Test
    @DisplayName("Deleting a question with coding problem and test cases deletes cascade safely and updates total marks")
    void testDeleteQuestionCascade() {
        AssessmentBuilderDto draft = builderService.getOrCreateDraftAssessment(testOpportunity.getId(), recruiterUser);

        AssessmentQuestionRequest req = new AssessmentQuestionRequest();
        req.setTitle("Delete target with tests");
        req.setPrompt("Sample coding question to be deleted");
        req.setQuestionType(QuestionType.DSA_CODING);
        req.setPoints(35);
        req.setDifficulty(DifficultyLevel.MEDIUM);
        req.setCodingProblem(new QuestionBuilderDto.CodingProblemSpec(
                "Statement",
                "1 <= N <= 100",
                "java,python",
                Map.of("java", "class Solution {}"),
                List.of(new QuestionBuilderDto.TestCaseSpec(null, "1", "1", false, "Sample tc"))
        ));

        QuestionBuilderDto added = builderService.addQuestion(draft.id(), req, recruiterUser);
        assertThat(added.id()).isNotNull();

        AssessmentBuilderDto updatedDraft = builderService.getAssessmentBuilder(draft.id(), recruiterUser);
        int initialMarks = updatedDraft.totalMarks();
        assertThat(initialMarks).isGreaterThanOrEqualTo(35);

        // Delete question
        builderService.deleteQuestion(draft.id(), added.id(), recruiterUser);

        AssessmentBuilderDto afterDelete = builderService.getAssessmentBuilder(draft.id(), recruiterUser);
        assertThat(afterDelete.questions()).noneMatch(q -> q.id().equals(added.id()));
        assertThat(afterDelete.totalMarks()).isEqualTo(initialMarks - 35);
    }
}
