package com.kasumio.assessment;

import com.kasumio.assessment.dto.*;
import com.kasumio.opportunity.*;
import com.kasumio.organization.*;
import com.kasumio.student.*;
import com.kasumio.user.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AssessmentIntegrityTest {

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private AssessmentAttemptRepository attemptRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    private User recruiterOrgA;
    private User recruiterOrgB;
    private Student candidate;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        Organization orgA = organizationRepository.save(new Organization("TechCorp Alpha", OrganizationType.COMPANY, "https://alpha.io"));
        Organization orgB = organizationRepository.save(new Organization("DevBeta Inc", OrganizationType.COMPANY, "https://beta.io"));

        recruiterOrgA = userRepository.save(new User("recruiterA_" + UUID.randomUUID() + "@test.com", "hash", Role.RECRUITER, orgA));
        recruiterOrgB = userRepository.save(new User("recruiterB_" + UUID.randomUUID() + "@test.com", "hash", Role.RECRUITER, orgB));

        User studentUser = userRepository.save(new User("student_" + UUID.randomUUID() + "@test.com", "hash", Role.STUDENT, null));
        candidate = studentRepository.save(new Student(studentUser, "Alice Integrity", "Bio", "MIT", 2026));

        Opportunity opp = opportunityRepository.save(new Opportunity(
                recruiterOrgA, "Senior Backend Lead", "Desc", OpportunityType.JOB, "Remote", WorkType.REMOTE
        ));

        assessment = assessmentRepository.save(new Assessment(
                opp, "Backend Systems Assessment", "Desc", 60, 70, null
        ));
    }

    @Test
    @DisplayName("Harmless events and minor blurs do not increment violation count")
    void testHarmlessTelemetry() {
        AssessmentAttemptDto attemptDto = assessmentService.startAttempt(
                assessment.getId(), candidate, new StartAssessmentRequest(SelfAssessmentLevel.MEDIUM, true)
        );

        TelemetryIngestRequest harmlessReq = new TelemetryIngestRequest();
        harmlessReq.setFocusChangeCount(2); // Normal minor switch
        harmlessReq.setBlurDurationMs(1500L); // 1.5s
        harmlessReq.setEventType("BLUR");

        TelemetryResponse resp = assessmentService.recordTelemetry(attemptDto.getId(), harmlessReq, candidate);

        assertThat(resp.violationCount()).isEqualTo(0);
        assertThat(resp.violationStatus()).isEqualTo("NORMAL");
        assertThat(resp.attemptLocked()).isFalse();
    }

    @Test
    @DisplayName("Two-Confirmed-Violation Policy: 1st warning then 2nd violation locks attempt")
    void testTwoViolationLockPolicy() {
        AssessmentAttemptDto attemptDto = assessmentService.startAttempt(
                assessment.getId(), candidate, new StartAssessmentRequest(SelfAssessmentLevel.MEDIUM, true)
        );

        // Violation 1: Sustained off-tab navigation (> 20s)
        TelemetryIngestRequest violation1 = new TelemetryIngestRequest();
        violation1.setEventType("SUSTAINED_BLUR");
        violation1.setBlurDurationMs(35000L);

        TelemetryResponse resp1 = assessmentService.recordTelemetry(attemptDto.getId(), violation1, candidate);
        assertThat(resp1.violationCount()).isEqualTo(1);
        assertThat(resp1.violationStatus()).isEqualTo("WARNING_1");
        assertThat(resp1.attemptLocked()).isFalse();

        AssessmentAttempt inFlight = attemptRepository.findById(attemptDto.getId()).orElseThrow();
        assertThat(inFlight.getStatus()).isEqualTo(AttemptStatus.IN_PROGRESS);

        // Violation 2: Massive external paste with zero keystrokes
        TelemetryIngestRequest violation2 = new TelemetryIngestRequest();
        violation2.setLargeChangesCount(3);
        violation2.setKeystrokeCount(2);

        TelemetryResponse resp2 = assessmentService.recordTelemetry(attemptDto.getId(), violation2, candidate);
        assertThat(resp2.violationCount()).isEqualTo(2);
        assertThat(resp2.violationStatus()).isEqualTo("TERMINATED_LOCKED");
        assertThat(resp2.attemptLocked()).isTrue();

        AssessmentAttempt lockedAttempt = attemptRepository.findById(attemptDto.getId()).orElseThrow();
        assertThat(lockedAttempt.getStatus()).isEqualTo(AttemptStatus.TERMINATED_INTEGRITY_PENDING_REVIEW);
    }

    @Test
    @DisplayName("Recruiter can overturn locked attempt with audit reason")
    void testRecruiterOverturnWorkflow() {
        AssessmentAttemptDto attemptDto = assessmentService.startAttempt(
                assessment.getId(), candidate, new StartAssessmentRequest(SelfAssessmentLevel.MEDIUM, true)
        );

        // Force two violations to lock attempt
        TelemetryIngestRequest v1 = new TelemetryIngestRequest();
        v1.setEventType("SUSTAINED_BLUR");
        v1.setBlurDurationMs(25000L);
        assessmentService.recordTelemetry(attemptDto.getId(), v1, candidate);

        TelemetryIngestRequest v2 = new TelemetryIngestRequest();
        v2.setEventType("SUSTAINED_BLUR");
        v2.setBlurDurationMs(25000L);
        assessmentService.recordTelemetry(attemptDto.getId(), v2, candidate);

        AssessmentAttempt locked = attemptRepository.findById(attemptDto.getId()).orElseThrow();
        assertThat(locked.getStatus()).isEqualTo(AttemptStatus.TERMINATED_INTEGRITY_PENDING_REVIEW);

        // Authorized recruiter from Org A overturns the lock
        AssessmentAttemptDto overturned = assessmentService.overturnIntegrityLock(
                attemptDto.getId(), "Verified candidate experienced dual-monitor OS notification glitch", recruiterOrgA
        );

        assertThat(overturned.getStatus()).isEqualTo(AttemptStatus.IN_PROGRESS);
        assertThat(overturned.getOverturnedByRecruiter()).isTrue();
        assertThat(overturned.getOverturnReason()).contains("dual-monitor");
    }

    @Test
    @DisplayName("Cross-tenant isolation: Recruiter from another organization cannot overturn lock")
    void testCrossTenantRecruiterCannotOverturn() {
        AssessmentAttemptDto attemptDto = assessmentService.startAttempt(
                assessment.getId(), candidate, new StartAssessmentRequest(SelfAssessmentLevel.MEDIUM, true)
        );

        // Lock attempt
        TelemetryIngestRequest v1 = new TelemetryIngestRequest();
        v1.setEventType("SUSTAINED_BLUR");
        assessmentService.recordTelemetry(attemptDto.getId(), v1, candidate);
        assessmentService.recordTelemetry(attemptDto.getId(), v1, candidate);

        // Recruiter B from unrelated organization attempts to overturn
        assertThatThrownBy(() -> assessmentService.overturnIntegrityLock(
                attemptDto.getId(), "Malicious overturn attempt", recruiterOrgB
        )).isInstanceOf(AccessDeniedException.class);
    }
}
