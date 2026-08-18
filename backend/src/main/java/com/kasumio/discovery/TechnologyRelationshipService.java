package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Technology Relationship Service
 * 
 * Manages technology relationships (Parent, Child, Related, Prerequisite, Successor).
 * Understands ecosystems and allows partial affinity scoring without awarding
 * unwarranted credit for unrelated technologies.
 */
@Service
public class TechnologyRelationshipService {

    private final SkillRelationshipRepository relationshipRepository;

    public TechnologyRelationshipService(SkillRelationshipRepository relationshipRepository) {
        this.relationshipRepository = relationshipRepository;
    }

    /**
     * Get direct relationships for a skill.
     */
    @Transactional(readOnly = true)
    public List<SkillRelationship> getDirectRelationships(Skill skill) {
        if (skill == null || skill.getId() == null) {
            return Collections.emptyList();
        }
        return relationshipRepository.findAllRelationshipsForSkill(skill.getId());
    }

    /**
     * Compute relationship affinity between a candidate target skill and a set of possessed skills.
     * Returns a score between 0.0 and 1.0 (e.g., 0.8 if direct parent/child or related with strong link).
     */
    @Transactional(readOnly = true)
    public double getAffinityScore(Skill targetSkill, Collection<Skill> possessedSkills) {
        if (targetSkill == null || possessedSkills == null || possessedSkills.isEmpty()) {
            return 0.0;
        }

        // Direct exact match
        for (Skill possessed : possessedSkills) {
            if (possessed.getId().equals(targetSkill.getId())) {
                return 1.0;
            }
        }

        double maxAffinity = 0.0;
        List<SkillRelationship> relationships = relationshipRepository.findAllRelationshipsForSkill(targetSkill.getId());

        for (SkillRelationship rel : relationships) {
            Skill otherSkill = rel.getSourceSkill().getId().equals(targetSkill.getId()) 
                    ? rel.getTargetSkill() 
                    : rel.getSourceSkill();

            boolean possessed = possessedSkills.stream().anyMatch(s -> s.getId().equals(otherSkill.getId()));
            if (possessed) {
                // Diminished credit for indirect/related technology (scaled by relationship strength)
                double score = rel.getStrength() * 0.5; // Max 0.5 partial credit for related tech
                if (score > maxAffinity) {
                    maxAffinity = score;
                }
            }
        }

        // Check same ecosystem bonus if not otherwise related
        if (maxAffinity == 0.0 && targetSkill.getEcosystem() != null) {
            boolean hasSameEcosystem = possessedSkills.stream()
                    .anyMatch(s -> s.getEcosystem() != null && s.getEcosystem().equalsIgnoreCase(targetSkill.getEcosystem()));
            if (hasSameEcosystem) {
                maxAffinity = 0.15; // Modest 15% ecosystem awareness bonus
            }
        }

        return maxAffinity;
    }

    /**
     * Find all related skills for a target skill.
     */
    @Transactional(readOnly = true)
    public Set<Skill> getRelatedSkills(Skill skill) {
        if (skill == null || skill.getId() == null) {
            return Collections.emptySet();
        }

        Set<Skill> related = new HashSet<>();
        List<SkillRelationship> list = relationshipRepository.findAllRelationshipsForSkill(skill.getId());
        for (SkillRelationship r : list) {
            if (r.getSourceSkill().getId().equals(skill.getId())) {
                related.add(r.getTargetSkill());
            } else {
                related.add(r.getSourceSkill());
            }
        }
        return related;
    }
}
