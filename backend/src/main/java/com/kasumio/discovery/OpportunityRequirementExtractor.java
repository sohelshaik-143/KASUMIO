package com.kasumio.discovery;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunitySkill;
import com.kasumio.opportunity.SkillRequirementType;
import com.kasumio.skill.Skill;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Opportunity Requirement Extractor
 * 
 * Extracts structured requirements, technologies, eligibility, experience, and education
 * from opportunity definitions and free-text descriptions without relying on naive exact matches.
 */
@Service
public class OpportunityRequirementExtractor {

    private final TechnologyNormalizationService normalizationService;

    public OpportunityRequirementExtractor(TechnologyNormalizationService normalizationService) {
        this.normalizationService = normalizationService;
    }

    public static class ExtractedRequirement {
        private final Skill skill;
        private final SkillRequirementType requirementType;
        private final boolean inferred;

        public ExtractedRequirement(Skill skill, SkillRequirementType requirementType, boolean inferred) {
            this.skill = skill;
            this.requirementType = requirementType;
            this.inferred = inferred;
        }

        public Skill getSkill() { return skill; }
        public SkillRequirementType getRequirementType() { return requirementType; }
        public boolean isInferred() { return inferred; }
    }

    public static class ExtractedOpportunityProfile {
        private final List<ExtractedRequirement> requirements;
        private final String inferredExperience;
        private final String inferredEducation;
        private final String inferredEligibility;

        public ExtractedOpportunityProfile(List<ExtractedRequirement> requirements, 
                                         String inferredExperience, 
                                         String inferredEducation, 
                                         String inferredEligibility) {
            this.requirements = requirements;
            this.inferredExperience = inferredExperience;
            this.inferredEducation = inferredEducation;
            this.inferredEligibility = inferredEligibility;
        }

        public List<ExtractedRequirement> getRequirements() { return requirements; }
        public String getInferredExperience() { return inferredExperience; }
        public String getInferredEducation() { return inferredEducation; }
        public String getInferredEligibility() { return inferredEligibility; }
    }

    /**
     * Extracts full structured profile from an Opportunity entity.
     */
    public ExtractedOpportunityProfile extract(Opportunity opportunity) {
        Map<Long, ExtractedRequirement> reqMap = new LinkedHashMap<>();

        // 1. Existing explicitly declared skills on the Opportunity
        if (opportunity.getSkills() != null) {
            for (OpportunitySkill oppSkill : opportunity.getSkills()) {
                if (oppSkill.getSkill() != null) {
                    reqMap.put(oppSkill.getSkill().getId(), 
                            new ExtractedRequirement(oppSkill.getSkill(), oppSkill.getSkillType(), false));
                }
            }
        }

        // 2. Extract technologies from title and description
        String combinedText = (opportunity.getTitle() != null ? opportunity.getTitle() : "") + " " 
                            + (opportunity.getDescription() != null ? opportunity.getDescription() : "");
        List<Skill> textExtractedSkills = normalizationService.extractFromText(combinedText);

        for (Skill s : textExtractedSkills) {
            if (!reqMap.containsKey(s.getId())) {
                // If found in description but not explicit, classify as INFERRED / PREFERRED
                reqMap.put(s.getId(), new ExtractedRequirement(s, SkillRequirementType.PREFERRED, true));
            }
        }

        // 3. Extract experience / education hints
        String experience = opportunity.getExperienceRequirements();
        if (experience == null || experience.isBlank()) {
            experience = parseExperience(combinedText);
        }

        String education = opportunity.getEducationRequirements();
        if (education == null || education.isBlank()) {
            education = parseEducation(combinedText);
        }

        String eligibility = opportunity.getEligibility();
        if (eligibility == null || eligibility.isBlank()) {
            eligibility = parseEligibility(combinedText);
        }

        return new ExtractedOpportunityProfile(
                new ArrayList<>(reqMap.values()),
                experience,
                education,
                eligibility
        );
    }

    private String parseExperience(String text) {
        Pattern pattern = Pattern.compile("(?i)(\\d+\\+?\\s*(?:to\\s*\\d+\\+?\\s*)?(?:years?|yrs?)\\s*(?:of)?\\s*(?:experience|exp)?)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        if (text.toLowerCase().contains("entry level") || text.toLowerCase().contains("no experience required") || text.toLowerCase().contains("intern")) {
            return "Entry Level / 0-1 Years";
        }
        return "Open";
    }

    private String parseEducation(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("master") || lower.contains("m.s.") || lower.contains("ms in")) {
            return "Master's Degree Preferred";
        }
        if (lower.contains("bachelor") || lower.contains("b.s.") || lower.contains("b.tech") || lower.contains("undergraduate")) {
            return "Bachelor's / Undergraduate";
        }
        if (lower.contains("phd") || lower.contains("doctorate")) {
            return "PhD / Research Degree";
        }
        return "Not Specified / Open";
    }

    private String parseEligibility(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("must be enrolled") || lower.contains("current student") || lower.contains("actively pursuing")) {
            return "Currently Enrolled Students";
        }
        if (lower.contains("recent graduate") || lower.contains("graduated within")) {
            return "Recent Graduates";
        }
        return "Open to all verified candidates";
    }
}
