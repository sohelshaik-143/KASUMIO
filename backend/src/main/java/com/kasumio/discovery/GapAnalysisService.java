package com.kasumio.discovery;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunityRepository;
import com.kasumio.opportunity.OpportunityStatus;
import com.kasumio.opportunity.SkillRequirementType;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Technology Gap Analysis Service
 * 
 * Analyzes technology gaps across the COMPLETE ecosystem.
 * Prioritizes gaps with explainable criteria (requirement status, frequency across opportunities, prerequisites).
 */
@Service
public class GapAnalysisService {

    private final DeterministicMatchScorer matchScorer;
    private final OpportunityRepository opportunityRepository;
    private final TechnologyRelationshipService relationshipService;

    public GapAnalysisService(
            DeterministicMatchScorer matchScorer,
            OpportunityRepository opportunityRepository,
            TechnologyRelationshipService relationshipService) {
        this.matchScorer = matchScorer;
        this.opportunityRepository = opportunityRepository;
        this.relationshipService = relationshipService;
    }

    public static class PrioritizedSkillGap {
        private final Skill skill;
        private final String priority; // HIGH, MEDIUM, LOW
        private final int opportunitiesAffectedCount;
        private final boolean isRequiredInKeyRole;
        private final String priorityReason;
        private final String recommendedAction;
        private final List<String> relatedOpportunityTitles;

        public PrioritizedSkillGap(Skill skill, String priority, int opportunitiesAffectedCount,
                                   boolean isRequiredInKeyRole, String priorityReason,
                                   String recommendedAction, List<String> relatedOpportunityTitles) {
            this.skill = skill;
            this.priority = priority;
            this.opportunitiesAffectedCount = opportunitiesAffectedCount;
            this.isRequiredInKeyRole = isRequiredInKeyRole;
            this.priorityReason = priorityReason;
            this.recommendedAction = recommendedAction;
            this.relatedOpportunityTitles = relatedOpportunityTitles;
        }

        public Skill getSkill() { return skill; }
        public String getPriority() { return priority; }
        public int getOpportunitiesAffectedCount() { return opportunitiesAffectedCount; }
        public boolean isRequiredInKeyRole() { return isRequiredInKeyRole; }
        public String getPriorityReason() { return priorityReason; }
        public String getRecommendedAction() { return recommendedAction; }
        public List<String> getRelatedOpportunityTitles() { return relatedOpportunityTitles; }
    }

    public static class StudentGapReport {
        private final int totalOpportunitiesAnalyzed;
        private final List<PrioritizedSkillGap> highPriorityGaps;
        private final List<PrioritizedSkillGap> mediumPriorityGaps;
        private final List<PrioritizedSkillGap> lowPriorityGaps;
        private final Map<String, Integer> gapsByCategory;

        public StudentGapReport(int totalOpportunitiesAnalyzed,
                                List<PrioritizedSkillGap> highPriorityGaps,
                                List<PrioritizedSkillGap> mediumPriorityGaps,
                                List<PrioritizedSkillGap> lowPriorityGaps,
                                Map<String, Integer> gapsByCategory) {
            this.totalOpportunitiesAnalyzed = totalOpportunitiesAnalyzed;
            this.highPriorityGaps = highPriorityGaps;
            this.mediumPriorityGaps = mediumPriorityGaps;
            this.lowPriorityGaps = lowPriorityGaps;
            this.gapsByCategory = gapsByCategory;
        }

        public int getTotalOpportunitiesAnalyzed() { return totalOpportunitiesAnalyzed; }
        public List<PrioritizedSkillGap> getHighPriorityGaps() { return highPriorityGaps; }
        public List<PrioritizedSkillGap> getMediumPriorityGaps() { return mediumPriorityGaps; }
        public List<PrioritizedSkillGap> getLowPriorityGaps() { return lowPriorityGaps; }
        public Map<String, Integer> getGapsByCategory() { return gapsByCategory; }
    }

    /**
     * Compute comprehensive gap report for a student across all active published opportunities.
     */
    @Transactional(readOnly = true)
    public StudentGapReport generateStudentGapReport(Student student) {
        List<Opportunity> publishedOpps = opportunityRepository.findPublishedWithSkills(OpportunityStatus.PUBLISHED);

        Map<Long, SkillGapTracker> trackerMap = new HashMap<>();

        for (Opportunity opp : publishedOpps) {
            if (opp.isExpired()) continue;

            DeterministicMatchScorer.MatchResult match = matchScorer.calculateMatch(student, opp);

            for (DeterministicMatchScorer.TechnologyMatchDetail missing : match.getMissingSkills()) {
                Skill skill = missing.getSkill();
                trackerMap.putIfAbsent(skill.getId(), new SkillGapTracker(skill));
                SkillGapTracker tracker = trackerMap.get(skill.getId());

                tracker.addOpportunity(opp.getTitle(), missing.getRequirementType() == SkillRequirementType.REQUIRED);
            }

            for (DeterministicMatchScorer.TechnologyMatchDetail partial : match.getPartialSkills()) {
                Skill skill = partial.getSkill();
                trackerMap.putIfAbsent(skill.getId(), new SkillGapTracker(skill));
                SkillGapTracker tracker = trackerMap.get(skill.getId());

                tracker.addPartialOpportunity(opp.getTitle());
            }
        }

        List<PrioritizedSkillGap> high = new ArrayList<>();
        List<PrioritizedSkillGap> medium = new ArrayList<>();
        List<PrioritizedSkillGap> low = new ArrayList<>();
        Map<String, Integer> categoryCounts = new HashMap<>();

        for (SkillGapTracker tracker : trackerMap.values()) {
            PrioritizedSkillGap gap = prioritize(tracker);

            String cat = tracker.skill.getCategory() != null ? tracker.skill.getCategory() : "General";
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0) + 1);

            switch (gap.getPriority()) {
                case "HIGH" -> high.add(gap);
                case "MEDIUM" -> medium.add(gap);
                default -> low.add(gap);
            }
        }

        // Sort each by affected opportunity count descending
        high.sort((a, b) -> Integer.compare(b.getOpportunitiesAffectedCount(), a.getOpportunitiesAffectedCount()));
        medium.sort((a, b) -> Integer.compare(b.getOpportunitiesAffectedCount(), a.getOpportunitiesAffectedCount()));
        low.sort((a, b) -> Integer.compare(b.getOpportunitiesAffectedCount(), a.getOpportunitiesAffectedCount()));

        return new StudentGapReport(publishedOpps.size(), high, medium, low, categoryCounts);
    }

    private PrioritizedSkillGap prioritize(SkillGapTracker tracker) {
        String priority;
        String reason;
        String action;

        if (tracker.requiredCount >= 2 || (tracker.requiredCount >= 1 && tracker.totalCount >= 3)) {
            priority = "HIGH";
            reason = "Strictly required across " + tracker.requiredCount + " relevant opportunity(s). Unblocks highest match scores.";
            action = "Build and verify 1 tangible project or repository demonstrating " + tracker.skill.getName() + ".";
        } else if (tracker.requiredCount == 1 || tracker.totalCount >= 2) {
            priority = "MEDIUM";
            reason = "Preferred or required in " + tracker.totalCount + " opportunity(s). Solid differentiator.";
            action = "Add coursework, certification or practical code sample for " + tracker.skill.getName() + ".";
        } else {
            priority = "LOW";
            reason = "Optional or secondary competency in current matching pool.";
            action = "Explore introductory tutorials or documentation for " + tracker.skill.getName() + ".";
        }

        return new PrioritizedSkillGap(
                tracker.skill,
                priority,
                tracker.totalCount,
                tracker.requiredCount > 0,
                reason,
                action,
                tracker.oppTitles.stream().limit(5).collect(Collectors.toList())
        );
    }

    private static class SkillGapTracker {
        private final Skill skill;
        private int requiredCount = 0;
        private int totalCount = 0;
        private final Set<String> oppTitles = new LinkedHashSet<>();

        public SkillGapTracker(Skill skill) {
            this.skill = skill;
        }

        public void addOpportunity(String title, boolean isRequired) {
            if (isRequired) requiredCount++;
            totalCount++;
            oppTitles.add(title);
        }

        public void addPartialOpportunity(String title) {
            totalCount++;
            oppTitles.add(title);
        }
    }
}
