package com.kasumio.action;

import com.kasumio.action.dto.*;
import com.kasumio.discovery.SkillRelationshipRepository;
import com.kasumio.discovery.UserPreference;
import com.kasumio.discovery.UserPreferenceRepository;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.goal.CareerGoal;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.opportunity.*;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CareerActionService {

    private final EvidenceRepository evidenceRepository;
    private final CareerGoalRepository careerGoalRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final SkillRepository skillRepository;
    private final CareerActionHistoryRepository historyRepository;
    private final CareerActionFeedbackRepository feedbackRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final OutcomeDecisionTraceRepository traceRepository;

    public CareerActionService(
            EvidenceRepository evidenceRepository,
            CareerGoalRepository careerGoalRepository,
            OpportunityRepository opportunityRepository,
            OpportunitySkillRepository opportunitySkillRepository,
            SkillRepository skillRepository,
            CareerActionHistoryRepository historyRepository,
            CareerActionFeedbackRepository feedbackRepository,
            UserPreferenceRepository userPreferenceRepository,
            OutcomeDecisionTraceRepository traceRepository) {
        this.evidenceRepository = evidenceRepository;
        this.careerGoalRepository = careerGoalRepository;
        this.opportunityRepository = opportunityRepository;
        this.opportunitySkillRepository = opportunitySkillRepository;
        this.skillRepository = skillRepository;
        this.historyRepository = historyRepository;
        this.feedbackRepository = feedbackRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.traceRepository = traceRepository;
    }

    /**
     * Determines the single primary "Your Next Move" action and up to 2 secondary alternatives.
     */
    @Transactional(readOnly = true)
    public CareerActionResponseDto findNextBestAction(Student student) {
        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        List<CareerGoal> goals = careerGoalRepository.findByStudentOrderByTitleAsc(student);
        String targetGoalTitle = goals.isEmpty() ? "Software Engineer" : goals.get(0).getTargetRole();

        // Extract user's existing technology names and completed actions
        Set<String> existingSkills = studentEvidence.stream()
                .map(e -> e.getSkill().getName())
                .collect(Collectors.toSet());

        Set<String> completedSkillActions = historyRepository.findByStudentAndStatus(student, "COMPLETED").stream()
                .map(CareerActionHistory::getTargetSkillName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> dismissedActions = historyRepository.findByStudentAndStatus(student, "DISMISSED").stream()
                .map(CareerActionHistory::getActionId)
                .collect(Collectors.toSet());

        // Also check per-user negative preferences
        Set<String> avoidedTech = userPreferenceRepository.findByStudent(student).stream()
                .filter(p -> "AVOID_TECH".equals(p.getPreferenceKey()))
                .map(UserPreference::getPreferenceValue)
                .collect(Collectors.toSet());

        List<Opportunity> publishedOpps = opportunityRepository.findAll().stream()
                .filter(o -> o.getStatus() == OpportunityStatus.PUBLISHED)
                .collect(Collectors.toList());

        // Compute missing required/preferred skills across active opportunities aligned with goal
        Map<String, SkillGapScore> gapScores = new HashMap<>();

        for (Opportunity opp : publishedOpps) {
            boolean matchesGoal = isOpportunityAlignedWithGoal(opp, targetGoalTitle);
            List<OpportunitySkill> oppSkills = opp.getSkills();
            if (oppSkills == null || oppSkills.isEmpty()) {
                oppSkills = opportunitySkillRepository.findByOpportunityId(opp.getId());
            }
            for (OpportunitySkill os : oppSkills) {
                String skillName = os.getSkill().getName();

                // Skip if student already has verified/unverified evidence for this skill or completed action
                if (existingSkills.contains(skillName) || completedSkillActions.contains(skillName)) {
                    continue;
                }
                if (avoidedTech.contains(skillName)) {
                    continue;
                }

                SkillGapScore score = gapScores.computeIfAbsent(skillName, k -> new SkillGapScore(os.getSkill()));
                score.affectedOpportunities++;
                if (matchesGoal) {
                    score.goalAlignmentBonus += 2.0;
                }
                if (os.getSkillType() == SkillRequirementType.REQUIRED) {
                    score.requiredCount++;
                } else {
                    score.preferredCount++;
                }
            }
        }

        List<SkillGapScore> sortedGaps = gapScores.values().stream()
                .sorted((a, b) -> Double.compare(b.calculatePriority(), a.calculatePriority()))
                .collect(Collectors.toList());

        List<CareerActionDto> candidates = new ArrayList<>();

        if (sortedGaps.isEmpty()) {
            // Default fallback when evidence covers all gaps or empty database
            candidates.add(createProfileOptimizationAction(studentEvidence));
        } else {
            for (SkillGapScore gapScore : sortedGaps) {
                Skill gapSkill = gapScore.skill;
                String actionId = "action-" + gapSkill.getName().toLowerCase().replaceAll("[^a-z0-9]", "-");

                if (dismissedActions.contains(actionId)) {
                    continue;
                }

                CareerActionDto action = buildActionForSkill(student, gapSkill, gapScore, studentEvidence, targetGoalTitle);
                candidates.add(action);
            }
        }

        if (candidates.isEmpty()) {
            candidates.add(createProfileOptimizationAction(studentEvidence));
        }

        CareerActionDto primaryAction = candidates.get(0);

        // Check if there is an active STARTED action in history, make that primary
        Optional<CareerActionHistory> startedOpt = historyRepository.findByStudentAndStatus(student, "STARTED").stream().findFirst();
        if (startedOpt.isPresent()) {
            CareerActionHistory started = startedOpt.get();
            for (CareerActionDto candidate : candidates) {
                if (candidate.getId().equals(started.getActionId())) {
                    candidate.setStatus("STARTED");
                    primaryAction = candidate;
                    break;
                }
            }
        }

        final String primaryId = primaryAction.getId();
        List<CareerActionDto> alternatives = candidates.stream()
                .filter(c -> !c.getId().equals(primaryId))
                .limit(2)
                .collect(Collectors.toList());

        String primaryEcosystem = detectPrimaryEcosystem(studentEvidence, targetGoalTitle);

        boolean insufficientEvidence = studentEvidence.isEmpty();
        String confidenceLevel = insufficientEvidence ? "LOW" : (studentEvidence.size() >= 3 ? "HIGH" : "MEDIUM");
        String confidenceMessage = insufficientEvidence
                ? "I don't have enough evidence to confidently recommend your next step yet."
                : null;

        String currentTechStr = studentEvidence.isEmpty() ? "Starting Profile" : studentEvidence.get(0).getSkill().getName();
        String gapTechStr = primaryAction.getTargetSkillName();
        String flowActionTitle = primaryAction.getTitle();
        String expectedEvidenceStr = primaryAction.getTargetSkillName() + " Implementation Evidence";
        String targetOutcomeStr = targetGoalTitle + " Opportunity Readiness";

        VisualFlowDto visualFlow = new VisualFlowDto(currentTechStr, gapTechStr, flowActionTitle, expectedEvidenceStr, targetOutcomeStr);

        return new CareerActionResponseDto(primaryAction, alternatives, targetGoalTitle, primaryEcosystem,
                confidenceLevel, insufficientEvidence, confidenceMessage, visualFlow);
    }

    /**
     * Builds detailed action model for modal view.
     */
    @Transactional(readOnly = true)
    public CareerActionDetailDto getActionDetails(Student student, String actionId) {
        CareerActionResponseDto response = findNextBestAction(student);
        CareerActionDto targetDto = null;

        if (response.getPrimaryNextMove() != null && response.getPrimaryNextMove().getId().equals(actionId)) {
            targetDto = response.getPrimaryNextMove();
        } else if (response.getAlternativeMoves() != null) {
            for (CareerActionDto alt : response.getAlternativeMoves()) {
                if (alt.getId().equals(actionId)) {
                    targetDto = alt;
                    break;
                }
            }
        }

        if (targetDto == null) {
            // Fallback for custom or direct ID lookup
            targetDto = createFallbackActionDto(actionId);
        }

        List<String> targetOpps = opportunityRepository.findAll().stream()
                .filter(o -> o.getStatus() == OpportunityStatus.PUBLISHED)
                .limit(3)
                .map(Opportunity::getTitle)
                .collect(Collectors.toList());

        String whatToDo = "1. Open your code editor and select your project codebase.\n" +
                "2. Implement the required " + targetDto.getTargetSkillName() + " configuration/module.\n" +
                "3. Verify functional execution and document architecture/setup in your README.\n" +
                "4. Push your commits to GitHub and upload the link to KASUMIO.";

        String successCriteria = "A public GitHub repository or live URL demonstrating working " +
                targetDto.getTargetSkillName() + " implementation with clear setup instructions.";

        String prep = "Review official documentation for " + targetDto.getTargetSkillName() +
                " and inspect sample repositories demonstrating best practice configuration.";

        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        String currentTechStr = studentEvidence.isEmpty() ? "Starting Profile" : studentEvidence.get(0).getSkill().getName();
        VisualFlowDto flow = new VisualFlowDto(
                currentTechStr,
                targetDto.getTargetSkillName(),
                targetDto.getTitle(),
                targetDto.getTargetSkillName() + " Evidence",
                response.getCareerGoalTitle() + " Readiness"
        );

        return new CareerActionDetailDto(
                targetDto.getId(),
                targetDto.getTitle(),
                targetDto.getDescription(),
                whatToDo,
                targetDto.getReasoning(),
                targetDto.getReusedProjectName(),
                targetDto.getTargetSkillName(),
                targetOpps,
                targetDto.getEvidenceRoi(),
                targetDto.getEstimatedEffort(),
                successCriteria,
                prep,
                targetDto.getSuggestedTemplateTitle(),
                flow
        );
    }

    /**
     * Marks action as STARTED in student history.
     */
    @Transactional
    public void startAction(Student student, String actionId) {
        Optional<CareerActionHistory> existingOpt = historyRepository.findFirstByStudentAndActionIdOrderByCreatedAtDesc(student, actionId);
        if (existingOpt.isPresent()) {
            CareerActionHistory hist = existingOpt.get();
            hist.setStatus("STARTED");
            historyRepository.save(hist);
        } else {
            CareerActionDetailDto detail = getActionDetails(student, actionId);
            CareerActionHistory hist = new CareerActionHistory(student, actionId, detail.getTitle(), detail.getCapabilityStrengthened(), "STARTED");
            historyRepository.save(hist);
        }
    }

    /**
     * Marks action as SKIPPED in student history.
     */
    @Transactional
    public void skipAction(Student student, String actionId) {
        CareerActionHistory hist = historyRepository.findFirstByStudentAndActionIdOrderByCreatedAtDesc(student, actionId)
                .orElse(new CareerActionHistory(student, actionId, "Skipped Action", actionId.replace("action-", ""), "SKIPPED"));
        hist.setStatus("SKIPPED");
        historyRepository.save(hist);
    }

    /**
     * Retrieves chronological action history for student.
     */
    @Transactional(readOnly = true)
    public List<CareerActionHistory> getStudentHistory(Student student) {
        return historyRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    /**
     * Marks action as COMPLETED and links uploaded evidence.
     */
    @Transactional
    public void completeAction(Student student, String actionId, Long evidenceId) {
        Evidence evidence = null;
        if (evidenceId != null) {
            evidence = evidenceRepository.findById(evidenceId).orElse(null);
        }

        Optional<CareerActionHistory> existingOpt = historyRepository.findFirstByStudentAndActionIdOrderByCreatedAtDesc(student, actionId);
        CareerActionHistory hist;
        if (existingOpt.isPresent()) {
            hist = existingOpt.get();
        } else {
            CareerActionDetailDto detail = getActionDetails(student, actionId);
            hist = new CareerActionHistory(student, actionId, detail.getTitle(), detail.getCapabilityStrengthened(), "STARTED");
        }

        hist.setStatus("COMPLETED");
        hist.setCompletedAt(LocalDateTime.now());
        if (evidence != null) {
            hist.setEvidence(evidence);
        }
        historyRepository.save(hist);

        OutcomeDecisionTrace trace = new OutcomeDecisionTrace(
                student,
                "ACTION_COMPLETED",
                hist.getTargetSkillName() != null ? hist.getTargetSkillName() : "Career Goal Action",
                "RECOMMENDED",
                "COMPLETED",
                evidence != null ? evidence.getId() : null,
                null,
                actionId,
                1,
                "ACTION_LIFECYCLE_COMPLETION",
                "Completed action: '" + hist.getActionTitle() + "'. Demonstrated capability updated."
        );
        traceRepository.save(trace);
    }

    /**
     * Records student feedback for recommendation customization.
     */
    @Transactional
    public void submitFeedback(Student student, CareerActionFeedbackRequest request) {
        CareerActionFeedback fb = new CareerActionFeedback(
                student,
                request.getActionId(),
                request.getFeedbackType(),
                request.getFeedbackText()
        );
        feedbackRepository.save(fb);

        // Record per-user preference penalty if negative signal
        if ("NOT_INTERESTED".equalsIgnoreCase(request.getFeedbackType()) ||
                "TOO_DIFFICULT".equalsIgnoreCase(request.getFeedbackType()) ||
                "WRONG_GOAL".equalsIgnoreCase(request.getFeedbackType())) {
            
            // Extract target tech from actionId e.g. "action-docker" -> "Docker"
            String techName = request.getActionId().replace("action-", "").replaceAll("-", " ");
            if (!userPreferenceRepository.findByStudentAndPreferenceKeyAndPreferenceValue(student, "AVOID_TECH", techName).isPresent()) {
                UserPreference pref = new UserPreference(student, "AVOID_TECH", techName, 1.5);
                userPreferenceRepository.save(pref);
            }

            // Also mark action as DISMISSED in history
            CareerActionHistory hist = historyRepository.findFirstByStudentAndActionIdOrderByCreatedAtDesc(student, request.getActionId())
                    .orElse(new CareerActionHistory(student, request.getActionId(), "Dismissed Action", techName, "DISMISSED"));
            hist.setStatus("DISMISSED");
            historyRepository.save(hist);
        }
    }

    @Transactional(readOnly = true)
    public CareerActionImpactDto calculateActionImpact(Student student, String actionId) {
        CareerActionDetailDto detail = getActionDetails(student, actionId);
        int affectedCount = detail.getTargetedOpportunities() != null ? detail.getTargetedOpportunities().size() : 1;

        String summary = "Adding verifiable evidence for " + detail.getCapabilityStrengthened() +
                " improves your readiness for " + affectedCount + " active opportunities aligned with your career goal.";

        return new CareerActionImpactDto(actionId, detail.getCapabilityStrengthened(), detail.getEvidenceRoi(), affectedCount, summary);
    }

    // --- Private Helper Methods ---

    private CareerActionDto buildActionForSkill(
            Student student,
            Skill gapSkill,
            SkillGapScore gapScore,
            List<Evidence> studentEvidence,
            String targetGoalTitle) {

        String gapName = gapSkill.getName();
        String actionId = "action-" + gapName.toLowerCase().replaceAll("[^a-z0-9]", "-");
        EvidenceRoi roi = gapScore.requiredCount > 0 ? EvidenceRoi.HIGH : EvidenceRoi.MEDIUM;

        // Detect if student already has a relevant existing project to extend
        String existingTech = studentEvidence.stream()
                .map(e -> e.getSkill().getName())
                .distinct()
                .limit(2)
                .collect(Collectors.joining(" and "));

        String title;
        String description;
        String reasoning;
        String reusedProject = existingTech.isEmpty() ? null : existingTech + " Application";
        String effort = "Moderate";
        String templateTitle = "GitHub / Git Repository";

        if (gapName.equalsIgnoreCase("Docker") || gapName.equalsIgnoreCase("Kubernetes") || gapName.equalsIgnoreCase("CI/CD")) {
            if (!existingTech.isEmpty()) {
                title = "Containerize your " + existingTech + " project";
                description = "Add a Dockerfile and docker-compose orchestration to your existing codebase.";
                reasoning = "Containerization is required by multiple opportunities you are close to. Extending your existing " +
                        existingTech + " repository yields high-leverage proof without building from scratch.";
            } else {
                title = "Build and containerize a REST service with Docker";
                description = "Create a lightweight REST service with a Dockerfile and docker-compose setup.";
                reasoning = "Practical containerization proof demonstrates immediate operational readiness for target opportunities.";
                effort = "High";
            }
        } else if (gapName.equalsIgnoreCase("AWS") || gapName.equalsIgnoreCase("Azure") || gapName.equalsIgnoreCase("Google Cloud Platform") || gapName.equalsIgnoreCase("GCP")) {
            if (!existingTech.isEmpty()) {
                title = "Deploy your " + existingTech + " project to " + gapName;
                description = "Deploy your existing repository to cloud infrastructure (e.g. serverless or container service).";
                reasoning = "Cloud deployment of existing work provides verifiable infrastructure evidence required by " +
                        gapScore.affectedOpportunities + " relevant opportunities.";
            } else {
                title = "Deploy a microservice to " + gapName;
                description = "Deploy a lightweight backend service to " + gapName + " and document cloud architecture.";
                reasoning = "Demonstrable cloud deployment artifacts prove hands-on infrastructure capability.";
                effort = "High";
            }
        } else if (gapName.equalsIgnoreCase("PostgreSQL") || gapName.equalsIgnoreCase("MySQL") || gapName.equalsIgnoreCase("MongoDB") || gapName.equalsIgnoreCase("Redis")) {
            if (!existingTech.isEmpty()) {
                title = "Add " + gapName + " persistence to your " + existingTech + " project";
                description = "Integrate database schema, queries, and migrations into your active codebase.";
                reasoning = "Adding database persistence to an existing repository demonstrates data-tier competence with minimal overhead.";
            } else {
                title = "Build a database-backed API with " + gapName;
                description = "Design a relational database schema and API endpoints connected to " + gapName + ".";
                reasoning = "Demonstrable database schema and query evidence proves backend data capability.";
            }
        } else if (gapName.equalsIgnoreCase("RAG") || gapName.equalsIgnoreCase("Large Language Models") || gapName.equalsIgnoreCase("LangChain") || gapName.equalsIgnoreCase("Vector Embeddings")) {
            if (!existingTech.isEmpty() && (existingTech.contains("Python") || existingTech.contains("FastAPI"))) {
                title = "Add evaluation and monitoring to your RAG pipeline";
                description = "Implement semantic evaluation metrics and vector store retrieval logging.";
                reasoning = "Evaluating and monitoring your existing RAG system creates high-value AI engineering evidence.";
            } else {
                title = "Build a RAG semantic search pipeline with vector embeddings";
                description = "Develop an end-to-end Retrieval-Augmented Generation pipeline using document embeddings.";
                reasoning = "Semantic search and document retrieval workflows create strong evidence in AI engineering.";
            }
        } else if (gapName.equalsIgnoreCase("Embedded C") || gapName.equalsIgnoreCase("Microcontrollers") || gapName.equalsIgnoreCase("RTOS") || gapName.equalsIgnoreCase("C++")) {
            title = "Build a firmware protocol module with " + gapName;
            description = "Develop hardware interface or embedded protocol code with hardware simulation/testing.";
            reasoning = "Concrete hardware/software interfacing artifacts prove specialized embedded systems capability.";
            effort = "High";
        } else {
            title = "Implement a focused module demonstrating " + gapName;
            description = "Add " + gapName + " functionality to your project with clean unit tests and setup documentation.";
            reasoning = "Addressing this requirement strengthens your readiness for " + gapScore.affectedOpportunities +
                    " active opportunities aligned with " + targetGoalTitle + ".";
        }

        return new CareerActionDto(
                actionId,
                title,
                description,
                reasoning,
                gapName,
                gapSkill.getCategory() != null ? gapSkill.getCategory() : "Technology Action",
                roi,
                effort,
                reusedProject,
                gapScore.affectedOpportunities,
                "RECOMMENDED",
                templateTitle
        );
    }

    private CareerActionDto createProfileOptimizationAction(List<Evidence> studentEvidence) {
        return new CareerActionDto(
                "action-profile-optimization",
                "Enhance documentation for your existing evidence portfolio",
                "Add architecture diagrams, README setup steps, and verification links to your active projects.",
                "Your evidence stack already covers core requirements. Adding detailed documentation and requesting verification strengthens recruiter confidence.",
                "Portfolio Proof",
                "Career Growth",
                EvidenceRoi.HIGH,
                "Low",
                studentEvidence.isEmpty() ? null : studentEvidence.get(0).getSkill().getName() + " Project",
                3,
                "RECOMMENDED",
                "GitHub / Git Repository"
        );
    }

    private CareerActionDto createFallbackActionDto(String actionId) {
        String skillName = actionId.replace("action-", "").replaceAll("-", " ");
        skillName = Character.toUpperCase(skillName.charAt(0)) + skillName.substring(1);
        return new CareerActionDto(
                actionId,
                "Containerize or deploy project with " + skillName,
                "Implement " + skillName + " configuration in your project repository.",
                "Strengthens readiness for target career opportunities.",
                skillName,
                "Technical Capability",
                EvidenceRoi.HIGH,
                "Moderate",
                "Active Repository",
                2,
                "RECOMMENDED",
                "GitHub / Git Repository"
        );
    }

    private boolean isOpportunityAlignedWithGoal(Opportunity opp, String targetGoal) {
        if (targetGoal == null || targetGoal.trim().isEmpty()) return true;
        String goalLower = targetGoal.toLowerCase();
        String oppTitleLower = opp.getTitle() != null ? opp.getTitle().toLowerCase() : "";
        String oppTypeLower = opp.getType() != null ? opp.getType().name().toLowerCase() : "";
        return oppTitleLower.contains(goalLower) || oppTypeLower.contains(goalLower) ||
                (goalLower.contains("backend") && oppTitleLower.contains("backend")) ||
                (goalLower.contains("ai") && (oppTitleLower.contains("ai") || oppTitleLower.contains("machine learning"))) ||
                (goalLower.contains("full stack") && oppTitleLower.contains("full stack")) ||
                (goalLower.contains("embedded") && oppTitleLower.contains("embedded"));
    }

    private String detectPrimaryEcosystem(List<Evidence> studentEvidence, String targetGoalTitle) {
        for (Evidence e : studentEvidence) {
            String name = e.getSkill().getName();
            if ("Java".equalsIgnoreCase(name) || "Spring Boot".equalsIgnoreCase(name)) return "JVM / Java";
            if ("Python".equalsIgnoreCase(name) || "PyTorch".equalsIgnoreCase(name) || "FastAPI".equalsIgnoreCase(name)) return "Python & AI";
            if ("React".equalsIgnoreCase(name) || "JavaScript".equalsIgnoreCase(name) || "TypeScript".equalsIgnoreCase(name)) return "JavaScript / Web";
            if ("C++".equalsIgnoreCase(name) || "Embedded C".equalsIgnoreCase(name)) return "Systems & Embedded";
        }
        if (targetGoalTitle.toLowerCase().contains("ai")) return "Python & AI";
        if (targetGoalTitle.toLowerCase().contains("backend")) return "JVM / Java";
        if (targetGoalTitle.toLowerCase().contains("embedded")) return "Systems & Embedded";
        return "Web & Software Engineering";
    }

    private static class SkillGapScore {
        final Skill skill;
        int affectedOpportunities = 0;
        int requiredCount = 0;
        int preferredCount = 0;
        double goalAlignmentBonus = 0.0;

        SkillGapScore(Skill skill) {
            this.skill = skill;
        }

        double calculatePriority() {
            return (requiredCount * 3.0) + (preferredCount * 1.0) + (affectedOpportunities * 1.5) + goalAlignmentBonus;
        }
    }
}
