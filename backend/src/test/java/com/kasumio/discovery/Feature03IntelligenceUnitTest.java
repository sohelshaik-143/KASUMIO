package com.kasumio.discovery;

import com.kasumio.discovery.dto.FeedbackAnalyticsDto;
import com.kasumio.discovery.dto.RecommendationFeedbackRequest;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceIntelligenceService;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.opportunity.*;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class Feature03IntelligenceUnitTest {

    @Mock
    private VerificationRepository verificationRepository;

    @Mock
    private EvidenceRepository evidenceRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private RecommendationFeedbackRepository feedbackRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private OpportunityRepository opportunityRepository;

    private EvidenceIntelligenceService evidenceService;
    private EligibilityService eligibilityService;
    private NextBestActionService nextBestActionService;
    private FeedbackIntelligenceService feedbackService;

    private Student testStudent;
    private Opportunity testOpp;
    private Skill javaSkill;
    private Skill dockerSkill;

    @BeforeEach
    void setUp() {
        evidenceService = new EvidenceIntelligenceService(verificationRepository);
        eligibilityService = new EligibilityService();
        nextBestActionService = new NextBestActionService(evidenceRepository);
        feedbackService = new FeedbackIntelligenceService(recommendationRepository, feedbackRepository, userPreferenceRepository, opportunityRepository);

        User studentUser = new User("student@test.com", "pass", Role.STUDENT, null);
        testStudent = new Student(studentUser, "Jane Doe", "CS undergrad", "Stanford", 2026);

        User recruiterUser = new User("recruiter@test.com", "pass", Role.RECRUITER, null);
        testOpp = new Opportunity(recruiterUser, "Backend Intern", "Spring Boot development", OpportunityType.INTERNSHIP, "San Francisco", WorkType.REMOTE);
        testOpp.setStatus(OpportunityStatus.PUBLISHED);

        javaSkill = new Skill(1L, "Java", "Programming Language");
        dockerSkill = new Skill(2L, "Docker", "DevOps");
    }

    @Test
    void testEvidenceConfidenceDeterministic_Verified() {
        Evidence ev = new Evidence(testStudent, javaSkill, "Spring Boot Microservice", "Full backend service", "https://github.com/test", EvidenceType.PROJECT);
        ev.setId(100L);

        when(verificationRepository.existsByEvidenceId(100L)).thenReturn(true);

        EvidenceIntelligenceService.SkillEvidenceEvaluation eval = evidenceService.evaluateSkillEvidence(javaSkill, List.of(ev));

        assertEquals(EvidenceLevel.VERIFIED, eval.getConfidenceLevel());
        assertTrue(eval.isVerified());
        assertTrue(eval.isDemonstrated());
    }

    @Test
    void testEvidenceConfidenceDeterministic_StrongAcrossMultiple() {
        Evidence ev1 = new Evidence(testStudent, javaSkill, "Project 1", "desc", "http://url", EvidenceType.PROJECT);
        Evidence ev2 = new Evidence(testStudent, javaSkill, "Project 2", "desc", "http://url", EvidenceType.PROJECT);

        EvidenceIntelligenceService.SkillEvidenceEvaluation eval = evidenceService.evaluateSkillEvidence(javaSkill, List.of(ev1, ev2));

        assertEquals(EvidenceLevel.STRONG, eval.getConfidenceLevel());
        assertEquals(2, eval.getEvidenceCount());
    }

    @Test
    void testEvidenceConfidenceDeterministic_EmptyIsUnknown() {
        EvidenceIntelligenceService.SkillEvidenceEvaluation eval = evidenceService.evaluateSkillEvidence(dockerSkill, Collections.emptyList());

        assertEquals(EvidenceLevel.UNKNOWN, eval.getConfidenceLevel());
        assertFalse(eval.isDemonstrated());
    }

    @Test
    void testEligibilitySeparatedFromCapability_ActiveOpportunity() {
        EligibilityService.EligibilityEvaluation eval = eligibilityService.evaluateEligibility(testOpp, testStudent);

        assertTrue(eval.isEligible());
        assertTrue(eval.getFailedCriteria().isEmpty());
    }

    @Test
    void testEligibilitySeparatedFromCapability_ExpiredDeadline() {
        testOpp.setDeadline(Instant.now().minus(2, ChronoUnit.DAYS));

        EligibilityService.EligibilityEvaluation eval = eligibilityService.evaluateEligibility(testOpp, testStudent);

        assertFalse(eval.isEligible());
        assertFalse(eval.getFailedCriteria().isEmpty());
    }

    @Test
    void testNextBestActionAndEvidenceRoi() {
        List<Evidence> studentEvList = List.of(
                new Evidence(testStudent, javaSkill, "Java Project", "Java REST API", "http://github.com", EvidenceType.PROJECT)
        );
        when(evidenceRepository.findByStudentOrderByCreatedAtDesc(testStudent)).thenReturn(studentEvList);

        OpportunitySkill oppSkill = new OpportunitySkill(testOpp, dockerSkill, SkillRequirementType.REQUIRED);
        testOpp.setSkills(List.of(oppSkill));

        NextBestActionService.NextBestActionResult nba = nextBestActionService.determineNextAction(testStudent, testOpp, List.of(dockerSkill));

        assertNotNull(nba);
        assertEquals(EvidenceRoi.HIGH, nba.getEvidenceRoi());
        assertTrue(nba.getRecommendedAction().contains("Containerize your existing"));
    }

    @Test
    void testRecommendationFeedback_DoesNotAlterGlobalIntelligence() {
        testOpp.setId(50L);
        when(opportunityRepository.findById(50L)).thenReturn(Optional.of(testOpp));
        when(recommendationRepository.findByStudentAndOpportunity(testStudent, testOpp)).thenReturn(Optional.empty());
        when(recommendationRepository.save(any(Recommendation.class))).thenAnswer(i -> i.getArgument(0));

        RecommendationFeedbackRequest request = new RecommendationFeedbackRequest("NOT_MY_CAREER_DIRECTION", "I want frontend instead");
        feedbackService.submitFeedback(testStudent, 50L, request);

        // Verify feedback was recorded
        verify(feedbackRepository, times(1)).save(any(RecommendationFeedback.class));
        // Verify user preference was saved specifically for this student
        verify(userPreferenceRepository, times(1)).save(any(UserPreference.class));
    }

    @Test
    void testRepeatedFeedbackFlagsForReview() {
        testOpp.setId(50L);
        when(opportunityRepository.findById(50L)).thenReturn(Optional.of(testOpp));
        when(recommendationRepository.findByStudentAndOpportunity(testStudent, testOpp)).thenReturn(Optional.empty());
        when(recommendationRepository.save(any(Recommendation.class))).thenAnswer(i -> i.getArgument(0));
        when(feedbackRepository.countTechnologyMismatchReports(50L)).thenReturn(5L);

        RecommendationFeedbackRequest request = new RecommendationFeedbackRequest("WRONG_TECHNOLOGY", "Not actually using Spring");
        feedbackService.submitFeedback(testStudent, 50L, request);

        assertEquals("FLAGGED_FOR_REVIEW", testOpp.getVerificationStatus());
        verify(opportunityRepository, times(1)).save(testOpp);
    }
}
