package com.kasumio.agent;

import com.kasumio.agent.dto.ParsedIntentDto;
import com.kasumio.discovery.TechnologyNormalizationService;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Recruiter Intent Parser
 * 
 * Transforms unstructured recruiter natural-language prompts into structured opportunity specifications
 * and candidate discovery criteria without requiring tedious form-filling.
 */
@Service
public class RecruiterIntentParser {

    private final TechnologyNormalizationService normalizationService;
    private final SkillRepository skillRepository;

    private static final Pattern LOCATION_PATTERN = Pattern.compile("(?:in|at|based in)\\s+([A-Z][a-zA-Z\\s]+?)(?:\\.|,|\\s+with|\\s+for|\\s+prioritize|$)", Pattern.CASE_INSENSITIVE);

    public RecruiterIntentParser(TechnologyNormalizationService normalizationService, SkillRepository skillRepository) {
        this.normalizationService = normalizationService;
        this.skillRepository = skillRepository;
    }

    public ParsedIntentDto parseIntent(String rawIntent) {
        if (rawIntent == null || rawIntent.isBlank()) {
            throw new IllegalArgumentException("Intent cannot be empty");
        }

        String text = rawIntent.trim();
        String lower = text.toLowerCase();

        // 1. Detect Opportunity Type
        OpportunityType oppType = OpportunityType.INTERNSHIP; // Default
        if (lower.contains("intern") || lower.contains("internship") || lower.contains("co-op")) {
            oppType = OpportunityType.INTERNSHIP;
        } else if (lower.contains("full-time") || lower.contains("full time") || lower.contains("fulltime") || lower.contains("permanent") || lower.contains("junior developer") || lower.contains("fresher") || lower.contains("job")) {
            oppType = OpportunityType.JOB;
        } else if (lower.contains("contract") || lower.contains("freelance")) {
            oppType = OpportunityType.FREELANCE;
        } else if (lower.contains("project") || lower.contains("capstone")) {
            oppType = OpportunityType.PROJECT;
        }

        // 2. Detect Work Type
        WorkType workType = WorkType.REMOTE; // Default
        if (lower.contains("hybrid")) {
            workType = WorkType.HYBRID;
        } else if (lower.contains("on-site") || lower.contains("onsite") || lower.contains("in-office") || lower.contains("in office") || lower.contains("in person")) {
            workType = WorkType.ON_SITE;
        } else if (lower.contains("remote")) {
            workType = WorkType.REMOTE;
        }

        // 3. Extract Location
        String location = null;
        if (workType != WorkType.REMOTE) {
            Matcher locMatcher = LOCATION_PATTERN.matcher(text);
            if (locMatcher.find()) {
                String loc = locMatcher.group(1).trim();
                if (!loc.equalsIgnoreCase("remote") && !loc.equalsIgnoreCase("hybrid")) {
                    location = loc;
                }
            }
        }
        if (location == null && workType == WorkType.REMOTE) {
            location = "Remote";
        }

        // 4. Extract Technologies & Ecosystem
        List<Skill> detectedSkills = normalizationService.extractFromText(text);

        // Fallback: check manual keyword extraction if extractor missed any common taxonomy names
        if (detectedSkills.isEmpty()) {
            List<String> commonKeys = List.of("java", "spring boot", "spring", "mysql", "postgresql", "python", "react", "docker", "javascript", "typescript", "fastapi", "node.js");
            for (String key : commonKeys) {
                if (lower.contains(key)) {
                    normalizationService.resolve(key).ifPresent(detectedSkills::add);
                }
            }
        }

        // Deduplicate
        detectedSkills = detectedSkills.stream().distinct().collect(Collectors.toList());

        // Separate into REQUIRED vs PREFERRED based on context
        List<String> required = new ArrayList<>();
        List<String> preferred = new ArrayList<>();

        for (Skill s : detectedSkills) {
            String skillName = s.getName();
            String sLower = skillName.toLowerCase();

            // Check if context frames it as preferred
            if (isFramedAsPreferred(lower, sLower)) {
                preferred.add(skillName);
            } else {
                required.add(skillName);
            }
        }

        // Ensure at least 1 required skill if skills were found
        if (required.isEmpty() && !preferred.isEmpty()) {
            required.add(preferred.remove(0));
        }

        // 5. Synthesize Role Title
        String roleTitle = synthesizeRoleTitle(text, detectedSkills, oppType);

        // 6. Infer Ecosystem
        String ecosystem = inferEcosystem(detectedSkills);

        // 7. Generate Professional Description, Responsibilities, and Eligibility
        String description = generateDescription(roleTitle, oppType, workType, location, required, preferred);
        String responsibilities = generateResponsibilities(roleTitle, required, preferred);
        String eligibility = generateEligibility(oppType, workType, required);

        return new ParsedIntentDto(
                roleTitle,
                oppType,
                workType,
                location,
                required,
                preferred,
                ecosystem,
                description,
                responsibilities,
                eligibility
        );
    }

    private boolean isFramedAsPreferred(String fullText, String skillName) {
        String lowerSkill = skillName.toLowerCase();
        List<String> prefIndicators = List.of("preferred", "nice to have", "bonus", "plus", "optional", "good to have", "advantage");
        for (String ind : prefIndicators) {
            if (fullText.contains(ind)) {
                int indIdx = fullText.indexOf(ind);
                int skillIdx = fullText.indexOf(lowerSkill);
                if (indIdx != -1 && skillIdx != -1 && Math.abs(indIdx - skillIdx) < 50) {
                    String between = fullText.substring(Math.min(indIdx, skillIdx), Math.max(indIdx, skillIdx));
                    if (!between.contains(".")) {
                        return true;
                    }
                }
            }
        }
        Pattern explicitPref = Pattern.compile("(?:prefer|preferred|nice to have|plus|bonus)\\s+(?:knowledge of\\s+|experience in\\s+)?[a-zA-Z0-9\\s,]*?" + Pattern.quote(lowerSkill), Pattern.CASE_INSENSITIVE);
        return explicitPref.matcher(fullText).find();
    }

    private String synthesizeRoleTitle(String text, List<Skill> skills, OpportunityType oppType) {
        String lower = text.toLowerCase();
        String suffix = (oppType == OpportunityType.INTERNSHIP) ? "Intern" : "Engineer";

        if (lower.contains("backend") || lower.contains("back-end")) {
            String primaryTech = skills.stream()
                    .filter(s -> s.getName().equalsIgnoreCase("Java") || s.getName().equalsIgnoreCase("Python") || s.getName().equalsIgnoreCase("Go") || s.getName().equalsIgnoreCase("Node.js"))
                    .map(Skill::getName)
                    .findFirst()
                    .orElse("Backend");
            return primaryTech.equalsIgnoreCase("Backend") ? "Backend " + suffix : primaryTech + " Backend " + suffix;
        }

        if (lower.contains("frontend") || lower.contains("front-end")) {
            String primaryTech = skills.stream()
                    .filter(s -> s.getName().equalsIgnoreCase("React") || s.getName().equalsIgnoreCase("Angular") || s.getName().equalsIgnoreCase("Vue"))
                    .map(Skill::getName)
                    .findFirst()
                    .orElse("Frontend");
            return primaryTech.equalsIgnoreCase("Frontend") ? "Frontend " + suffix : primaryTech + " Frontend " + suffix;
        }

        if (lower.contains("full stack") || lower.contains("fullstack")) {
            return "Full Stack " + suffix;
        }

        if (lower.contains("data engineer") || lower.contains("data")) {
            return "Data " + suffix;
        }

        if (!skills.isEmpty()) {
            return skills.get(0).getName() + " Software " + suffix;
        }

        return "Software Engineering " + suffix;
    }

    private String inferEcosystem(List<Skill> skills) {
        for (Skill s : skills) {
            if (s.getEcosystem() != null && !s.getEcosystem().isBlank()) {
                return s.getEcosystem();
            }
        }
        return "Software Development";
    }

    private String generateDescription(String roleTitle, OpportunityType oppType, WorkType workType,
                                       String location, List<String> required, List<String> preferred) {
        StringBuilder sb = new StringBuilder();
        sb.append("We are looking for a motivated and evidence-driven ").append(roleTitle)
          .append(" to join our engineering team (").append(workType.name()).append("). ");
        sb.append("In this role, you will work on production systems, build demonstrable software artifacts, and collaborate with experienced engineers. ");
        sb.append("We value real demonstrable proof over superficial credentials; candidates with deployed projects, clean code repositories, and verified technical achievements are strongly prioritized.");
        return sb.toString();
    }

    private String generateResponsibilities(String roleTitle, List<String> required, List<String> preferred) {
        StringBuilder sb = new StringBuilder();
        sb.append("• Design, implement, and maintain robust services using ").append(String.join(", ", required)).append(".\n");
        sb.append("• Write clean, testable, and well-documented code with verifiable version control commits.\n");
        if (!preferred.isEmpty()) {
            sb.append("• Collaborate on architecture integrating ").append(String.join(", ", preferred)).append(".\n");
        }
        sb.append("• Participate in peer code reviews, system debugging, and engineering problem-solving.");
        return sb.toString();
    }

    private String generateEligibility(OpportunityType oppType, WorkType workType, List<String> required) {
        StringBuilder sb = new StringBuilder();
        sb.append("• Active student or recent graduate in Computer Science or related STEM disciplines.\n");
        sb.append("• Demonstrated evidence portfolio containing real projects built with ").append(String.join(", ", required)).append(".\n");
        sb.append("• Ability to execute in a ").append(workType.name().toLowerCase()).append(" engineering environment.");
        return sb.toString();
    }
}
