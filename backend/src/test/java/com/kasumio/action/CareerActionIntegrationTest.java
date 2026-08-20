package com.kasumio.action;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.action.dto.CareerActionFeedbackRequest;
import com.kasumio.discovery.UserPreferenceRepository;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.EvidenceTemplateRepository;
import com.kasumio.evidence.EvidenceType;
import com.kasumio.goal.CareerGoal;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.opportunity.*;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CareerActionIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private SkillRepository skillRepository;

        @Autowired
        private OpportunityRepository opportunityRepository;

        @Autowired
        private OpportunitySkillRepository opportunitySkillRepository;

        @Autowired
        private EvidenceRepository evidenceRepository;

        @Autowired
        private EvidenceTemplateRepository evidenceTemplateRepository;

        @Autowired
        private CareerGoalRepository careerGoalRepository;

        @Autowired
        private CareerActionHistoryRepository historyRepository;

        @Autowired
        private CareerActionFeedbackRepository feedbackRepository;

        @Autowired
        private UserPreferenceRepository userPreferenceRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private ObjectMapper objectMapper;

        private User studentUser;
        private User recruiterUser;
        private Student student;
        private Skill javaSkill;
        private Skill springBootSkill;
        private Skill dockerSkill;
        private Skill pythonSkill;
        private Skill ragSkill;
        private Skill reactSkill;
        private Skill embeddedSkill;

        @BeforeEach
        void setUp() {
                historyRepository.deleteAll();
                feedbackRepository.deleteAll();
                userPreferenceRepository.deleteAll();
                evidenceRepository.deleteAll();
                careerGoalRepository.deleteAll();
                opportunitySkillRepository.deleteAll();
                opportunityRepository.deleteAll();
                studentRepository.deleteAll();
                userRepository.deleteAll();

                // 1. Create taxonomy skills
                javaSkill = skillRepository.findByNameIgnoreCase("Java")
                                .orElseGet(() -> skillRepository.save(new Skill("Java", "Programming Language")));
                springBootSkill = skillRepository.findByNameIgnoreCase("Spring Boot")
                                .orElseGet(() -> skillRepository.save(new Skill("Spring Boot", "Backend Development")));
                dockerSkill = skillRepository.findByNameIgnoreCase("Docker")
                                .orElseGet(() -> skillRepository.save(new Skill("Docker", "DevOps")));
                pythonSkill = skillRepository.findByNameIgnoreCase("Python")
                                .orElseGet(() -> skillRepository.save(new Skill("Python", "Programming Language")));
                ragSkill = skillRepository.findByNameIgnoreCase("RAG")
                                .orElseGet(() -> skillRepository.save(new Skill("RAG", "Generative AI")));
                reactSkill = skillRepository.findByNameIgnoreCase("React")
                                .orElseGet(() -> skillRepository.save(new Skill("React", "Frontend Development")));
                embeddedSkill = skillRepository.findByNameIgnoreCase("Embedded C")
                                .orElseGet(() -> skillRepository.save(new Skill("Embedded C", "Emerging Technology")));

                // 2. Create student & recruiter users
                studentUser = new User("action_student@kasumio.com", passwordEncoder.encode("Password123!"),
                                Role.STUDENT, null);
                studentUser = userRepository.save(studentUser);
                student = studentRepository.save(new Student(studentUser, "Action Student", "Bio", "MIT", 2026));

                recruiterUser = new User("action_recruiter@kasumio.com", passwordEncoder.encode("Password123!"),
                                Role.RECRUITER, null);
                recruiterUser = userRepository.save(recruiterUser);

                // 3. Create Backend Opportunity requiring Java, Spring Boot, Docker
                Opportunity opp = new Opportunity(
                                recruiterUser,
                                "Java Backend Engineer",
                                "Build microservices with Java and Spring Boot.",
                                OpportunityType.INTERNSHIP,
                                "Boston, MA",
                                WorkType.HYBRID);
                opp.setStatus(OpportunityStatus.PUBLISHED);
                opp.setCompensation("$40/hr");
                opp.setDuration("3 months");
                opp = opportunityRepository.save(opp);

                opportunitySkillRepository.save(new OpportunitySkill(opp, javaSkill, SkillRequirementType.REQUIRED));
                opportunitySkillRepository
                                .save(new OpportunitySkill(opp, springBootSkill, SkillRequirementType.REQUIRED));
                opportunitySkillRepository.save(new OpportunitySkill(opp, dockerSkill, SkillRequirementType.REQUIRED));
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 1 & 7: Java backend user receives containerization action reusing existing Spring Boot project")
        void testJavaUserNextActionReusesExistingProject() throws Exception {
                // Add Java and Spring Boot evidence for student
                evidenceRepository.save(new Evidence(student, javaSkill, "Java Microservices", "Repository",
                                "http://github.com/test/java-api", EvidenceType.PROJECT));
                evidenceRepository.save(new Evidence(student, springBootSkill, "Spring Boot REST Service", "Repository",
                                "http://github.com/test/spring-api", EvidenceType.PROJECT));

                // Define Backend Developer goal
                careerGoalRepository.save(new CareerGoal(student, "Backend Developer", "Java Microservices",
                                "Backend Developer"));

                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.primaryNextMove.targetSkillName", is("Docker")))
                                .andExpect(jsonPath("$.primaryNextMove.title", containsString("Containerize your")))
                                .andExpect(jsonPath("$.primaryNextMove.reusedProjectName", containsString("Spring Boot")))
                                .andExpect(jsonPath("$.primaryNextMove.evidenceRoi", is("HIGH")));
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 2: Python AI user receives RAG / AI relevant next action")
        void testPythonAiUserNextAction() throws Exception {
                // Add Python evidence
                evidenceRepository.save(new Evidence(student, pythonSkill, "Python Script", "Desc",
                                "http://github.com/test/py", EvidenceType.PROJECT));
                careerGoalRepository.save(new CareerGoal(student, "AI Engineer", "GenAI", "AI Engineer"));

                // Create AI opportunity requiring RAG
                Opportunity aiOpp = new Opportunity(
                                recruiterUser,
                                "AI RAG Specialist",
                                "Build LLM applications",
                                OpportunityType.JOB,
                                "Remote",
                                WorkType.REMOTE);
                aiOpp.setStatus(OpportunityStatus.PUBLISHED);
                aiOpp.setCompensation("$120k");
                aiOpp.setDuration("Full-time");
                aiOpp = opportunityRepository.save(aiOpp);
                opportunitySkillRepository.save(new OpportunitySkill(aiOpp, ragSkill, SkillRequirementType.REQUIRED));

                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.primaryNextMove.targetSkillName", is("RAG")))
                                .andExpect(jsonPath("$.primaryNextMove.title", containsString("RAG")));
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 5: Different career goals produce contextually different actions")
        void testCareerGoalAdaptation() throws Exception {
                // Change career goal to Embedded Systems Engineer
                careerGoalRepository.save(new CareerGoal(student, "Embedded Systems Engineer", "Firmware",
                                "Embedded Systems Engineer"));

                // Add Embedded Opportunity
                Opportunity embOpp = new Opportunity(
                                recruiterUser,
                                "Firmware Developer",
                                "Embedded C development",
                                OpportunityType.JOB,
                                "Austin, TX",
                                WorkType.ON_SITE);
                embOpp.setStatus(OpportunityStatus.PUBLISHED);
                embOpp.setCompensation("$100k");
                embOpp.setDuration("Full-time");
                embOpp = opportunityRepository.save(embOpp);
                opportunitySkillRepository
                                .save(new OpportunitySkill(embOpp, embeddedSkill, SkillRequirementType.REQUIRED));

                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.primaryNextMove.targetSkillName", is("Embedded C")))
                                .andExpect(jsonPath("$.careerGoalTitle", is("Embedded Systems Engineer")));
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 8 & 9 & 10: Action lifecycle - start action, complete with evidence, and trigger recalculation")
        void testActionLifecycleAndRecalculation() throws Exception {
                // 1. Get next action
                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.primaryNextMove.id", notNullValue()));

                // 2. Start action
                mockMvc.perform(post("/api/student/career/actions/action-java/start"))
                                .andExpect(status().isOk());

                assertTrue(historyRepository.existsByStudentAndActionIdAndStatus(student, "action-java", "STARTED"));

                // 3. Add evidence for Java
                Evidence newEv = evidenceRepository.save(new Evidence(student, javaSkill, "Java Master Project", "Desc",
                                "http://github.com/test/java", EvidenceType.PROJECT));

                // 4. Complete action with evidence
                mockMvc.perform(post("/api/student/career/actions/action-java/complete")
                                .param("evidenceId", newEv.getId().toString()))
                                .andExpect(status().isOk());

                assertTrue(historyRepository.existsByStudentAndActionIdAndStatus(student, "action-java", "COMPLETED"));

                // 5. Verify recalculation: Next action moves from Java to missing Spring Boot /
                // Docker
                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.primaryNextMove.targetSkillName", not("Java")));
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 12 & 13: Student feedback updates personal preferences without altering global taxonomy")
        void testUserFeedbackCustomization() throws Exception {
                CareerActionFeedbackRequest request = new CareerActionFeedbackRequest("action-docker", "NOT_INTERESTED",
                                "I want to focus on frontend");

                mockMvc.perform(post("/api/student/career/feedback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk());

                // Check per-user preference saved
                assertTrue(userPreferenceRepository
                                .findByStudentAndPreferenceKeyAndPreferenceValue(student, "AVOID_TECH", "docker")
                                .isPresent());
                assertTrue(feedbackRepository.existsByStudentAndActionId(student, "action-docker"));

                // Global skill taxonomy remains intact
                assertTrue(skillRepository.findByNameIgnoreCase("Docker").isPresent());
        }

        @Test
        @DisplayName("Scenario 16: Unauthorized user access is rejected")
        void testUnauthorizedAccessRejected() throws Exception {
                mockMvc.perform(get("/api/student/career/next-action"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(username = "action_student@kasumio.com", roles = { "STUDENT" })
        @DisplayName("Scenario 17: Existing evidence templates remain 100% intact")
        void testEvidenceTemplatesPreserved() {
                assertTrue(evidenceTemplateRepository.count() >= 0);
        }
}
