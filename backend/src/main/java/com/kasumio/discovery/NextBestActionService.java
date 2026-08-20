package com.kasumio.discovery;

import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.opportunity.EvidenceRoi;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunitySkill;
import com.kasumio.opportunity.SkillRequirementType;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NextBestActionService {

    private final EvidenceRepository evidenceRepository;

    public NextBestActionService(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    public static class NextBestActionResult {
        private final String recommendedAction;
        private final String reasoning;
        private final EvidenceRoi evidenceRoi;
        private final String targetSkillName;

        public NextBestActionResult(String recommendedAction, String reasoning, EvidenceRoi evidenceRoi, String targetSkillName) {
            this.recommendedAction = recommendedAction;
            this.reasoning = reasoning;
            this.evidenceRoi = evidenceRoi;
            this.targetSkillName = targetSkillName;
        }

        public String getRecommendedAction() {
            return recommendedAction;
        }

        public String getReasoning() {
            return reasoning;
        }

        public EvidenceRoi getEvidenceRoi() {
            return evidenceRoi;
        }

        public String getTargetSkillName() {
            return targetSkillName;
        }
    }

    /**
     * Recommends the single most impactful, realistic next action a student can take.
     * Evaluates existing projects and bridges the primary gap.
     */
    public NextBestActionResult determineNextAction(Student student, Opportunity opportunity, List<Skill> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return new NextBestActionResult(
                    "Submit your profile or express mutual interest in this opportunity.",
                    "Your verifiable evidence already covers all required and preferred competencies.",
                    EvidenceRoi.HIGH,
                    "Readiness"
            );
        }

        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        Skill primaryGap = missingSkills.get(0);

        // Check if primary gap is REQUIRED in this opportunity
        boolean isRequired = opportunity != null && opportunity.getSkills() != null && opportunity.getSkills().stream()
                .anyMatch(os -> os.getSkill().getId().equals(primaryGap.getId()) && os.getSkillType() == SkillRequirementType.REQUIRED);

        EvidenceRoi roi = isRequired ? EvidenceRoi.HIGH : EvidenceRoi.MEDIUM;

        String gapName = primaryGap.getName();

        // Contextual mentor recommendation based on existing evidence stack
        String existingTech = studentEvidence.stream()
                .map(e -> e.getSkill().getName())
                .distinct()
                .limit(2)
                .collect(Collectors.joining(" and "));

        String action;
        String reasoning;

        if (gapName.equalsIgnoreCase("Docker") || gapName.equalsIgnoreCase("Kubernetes") || gapName.equalsIgnoreCase("CI/CD")) {
            if (!existingTech.isEmpty()) {
                action = "Containerize your existing " + existingTech + " project with Docker and add a deployment configuration.";
                reasoning = "Extending your existing " + existingTech + " repository with containerization yields high-leverage deployment proof without building a project from scratch.";
            } else {
                action = "Build and containerize a minimal REST service with a Dockerfile and docker-compose setup.";
                reasoning = "Practical containerization proof demonstrates immediate operational readiness.";
            }
        } else if (gapName.equalsIgnoreCase("AWS") || gapName.equalsIgnoreCase("Azure") || gapName.equalsIgnoreCase("Google Cloud Platform") || gapName.equalsIgnoreCase("GCP")) {
            if (!existingTech.isEmpty()) {
                action = "Deploy your existing " + existingTech + " project to " + gapName + " (e.g. using serverless or managed containers).";
                reasoning = "Cloud deployment of existing work provides verifiable infrastructure evidence.";
            } else {
                action = "Deploy a lightweight application to " + gapName + " and document architecture diagrams.";
                reasoning = "Real deployment artifacts demonstrate hands-on cloud capability.";
            }
        } else if (gapName.equalsIgnoreCase("PostgreSQL") || gapName.equalsIgnoreCase("MySQL") || gapName.equalsIgnoreCase("MongoDB") || gapName.equalsIgnoreCase("Redis")) {
            if (!existingTech.isEmpty()) {
                action = "Integrate " + gapName + " persistence and schema migrations into your existing " + existingTech + " codebase.";
                reasoning = "Adding database persistence to an existing codebase demonstrates data tier competence.";
            } else {
                action = "Create a database-backed API project using " + gapName + " with sample queries and schema migrations.";
                reasoning = "Demonstrable database schema and query evidence proves backend data capability.";
            }
        } else if (gapName.equalsIgnoreCase("RAG") || gapName.equalsIgnoreCase("Large Language Models") || gapName.equalsIgnoreCase("LangChain") || gapName.equalsIgnoreCase("Vector Embeddings")) {
            action = "Build an end-to-end Retrieval-Augmented Generation pipeline using " + gapName + " with actual document embeddings.";
            reasoning = "Demonstrating semantic search and retrieval workflows creates strong evidence in AI engineering.";
        } else if (gapName.equalsIgnoreCase("Embedded C") || gapName.equalsIgnoreCase("Microcontrollers") || gapName.equalsIgnoreCase("RTOS")) {
            action = "Develop a hardware-interfacing protocol module using " + gapName + " with clean tests.";
            reasoning = "Concrete hardware protocol artifacts prove specialized embedded systems capability.";
        } else {
            action = "Implement a focused project module demonstrating " + gapName + " with clean tests and documentation.";
            reasoning = "Concrete code artifacts and verification requests provide immediate evidence for missing competencies.";
        }

        return new NextBestActionResult(action, reasoning, roi, gapName);
    }
}
