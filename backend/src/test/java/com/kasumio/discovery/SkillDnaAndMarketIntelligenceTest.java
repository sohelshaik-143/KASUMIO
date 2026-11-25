package com.kasumio.discovery;

import com.kasumio.discovery.dto.OpportunityReadinessDto;
import com.kasumio.discovery.dto.TechnologySkillEvaluationDto;
import com.kasumio.evidence.*;
import com.kasumio.opportunity.*;
import com.kasumio.organization.*;
import com.kasumio.skill.*;
import com.kasumio.student.*;
import com.kasumio.user.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SkillDnaAndMarketIntelligenceTest {

    @Autowired
    private CareerIntelligenceService careerIntelligenceService;

    @Autowired
    private TechnologyNormalizationService normalizationService;

    @Autowired
    private EvidenceCapabilityAnalyzer capabilityAnalyzer;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private VerificationRepository verificationRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillAliasRepository aliasRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Student student;
    private Skill javaSkill;
    private Opportunity opportunity;
    private Organization org;
    private User recruiter;

    @BeforeEach
    void setUp() {
        org = organizationRepository.save(new Organization("DnaCorp", OrganizationType.COMPANY, "https://dnacorp.io"));
        recruiter = userRepository.save(new User("recruiter_dna_" + UUID.randomUUID() + "@test.com", "hash", Role.RECRUITER, org));
        User studentUser = userRepository.save(new User("student_dna_" + UUID.randomUUID() + "@test.com", "hash", Role.STUDENT, null));
        student = studentRepository.save(new Student(studentUser, "DNA Candidate", "Bio", "Stanford", 2026));

        javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseGet(() ->
                skillRepository.save(new Skill("Java", "Programming"))
        );

        aliasRepository.save(new SkillAlias("JDK 21", javaSkill));

        opportunity = opportunityRepository.save(new Opportunity(
                recruiter, "Senior Java Engineer", "Backend role", OpportunityType.JOB, "Remote", WorkType.REMOTE
        ));
    }

    @Test
    @DisplayName("Technology Normalization correctly resolves aliases and version stripped names")
    void testTechnologyNormalization() {
        Optional<Skill> direct = normalizationService.resolve("Java");
        assertThat(direct).isPresent();
        assertThat(direct.get().getName()).isEqualTo("Java");

        Optional<Skill> byAlias = normalizationService.resolve("JDK 21");
        assertThat(byAlias).isPresent();
        assertThat(byAlias.get().getName()).isEqualTo("Java");

        Optional<Skill> versionStripped = normalizationService.resolve("Java 17");
        assertThat(versionStripped).isPresent();
        assertThat(versionStripped.get().getName()).isEqualTo("Java");
    }

    @Test
    @DisplayName("Skill DNA produces 5 distinct metrics backed by verified evidence")
    void testFiveDistinctMetrics() {
        // Add evidence
        Evidence ev = evidenceRepository.save(new Evidence(
                student, javaSkill, "Spring Microservices Platform", "Built scalable backend architecture",
                "https://github.com/test/repo", EvidenceType.PROJECT
        ));
        verificationRepository.save(new Verification(ev, org, recruiter));

        Map<Long, EvidenceCapabilityAnalyzer.TechnologyCapability> caps = capabilityAnalyzer.analyzeStudentCapabilities(student);
        assertThat(caps).containsKey(javaSkill.getId());

        EvidenceCapabilityAnalyzer.TechnologyCapability javaCap = caps.get(javaSkill.getId());
        assertThat(javaCap.getAssessmentMarks()).isGreaterThanOrEqualTo(85);
        assertThat(javaCap.getSkillProficiency()).isEqualTo("ADVANCED");
        assertThat(javaCap.getEvidenceConfidence()).isGreaterThanOrEqualTo(0.85);
        assertThat(javaCap.getMarketReadiness()).isGreaterThanOrEqualTo(85.0);
        assertThat(javaCap.getOpportunityMatch()).isGreaterThan(0.0);

        OpportunityReadinessDto readiness = careerIntelligenceService.getOpportunityReadiness(student, opportunity.getId());
        assertThat(readiness).isNotNull();
        assertThat(readiness.getSkillCoverage()).isNotEmpty();

        TechnologySkillEvaluationDto eval = readiness.getSkillCoverage().get(0);
        assertThat(eval.getAssessmentMarks()).isNotNull();
        assertThat(eval.getSkillProficiency()).isNotNull();
        assertThat(eval.getEvidenceConfidence()).isNotNull();
        assertThat(eval.getMarketReadiness()).isNotNull();
        assertThat(eval.getOpportunityMatch()).isNotNull();
    }

    @Test
    @DisplayName("Evidence history is append-only across successive assessment attempts")
    void testAppendOnlyEvidenceHistory() {
        int initialCount = evidenceRepository.findByStudentOrderByCreatedAtDesc(student).size();

        Evidence ev1 = evidenceRepository.save(new Evidence(
                student, javaSkill, "Assessment Round 1 Verified", "Pass attempt 1", "https://url1", EvidenceType.CERTIFICATE
        ));
        Evidence ev2 = evidenceRepository.save(new Evidence(
                student, javaSkill, "Assessment Round 2 Verified", "Pass attempt 2", "https://url2", EvidenceType.CERTIFICATE
        ));

        List<Evidence> studentEvidences = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        assertThat(studentEvidences).hasSize(initialCount + 2);
        assertThat(studentEvidences).extracting(Evidence::getId).contains(ev1.getId(), ev2.getId());
        assertThat(studentEvidences).extracting(Evidence::getTitle)
                .contains("Assessment Round 1 Verified", "Assessment Round 2 Verified");
    }
}
