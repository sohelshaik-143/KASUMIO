package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillRelationshipRepository extends JpaRepository<SkillRelationship, Long> {
    List<SkillRelationship> findBySourceSkill(Skill sourceSkill);
    List<SkillRelationship> findByTargetSkill(Skill targetSkill);
    List<SkillRelationship> findBySourceSkillAndRelationshipType(Skill sourceSkill, String relationshipType);

    @Query("SELECT sr FROM SkillRelationship sr WHERE sr.sourceSkill.id = :skillId OR sr.targetSkill.id = :skillId")
    List<SkillRelationship> findAllRelationshipsForSkill(@Param("skillId") Long skillId);
}
