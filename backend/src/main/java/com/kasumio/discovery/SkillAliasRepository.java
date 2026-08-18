package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillAliasRepository extends JpaRepository<SkillAlias, Long> {
    Optional<SkillAlias> findByAliasNameIgnoreCase(String aliasName);
    List<SkillAlias> findBySkill(Skill skill);
    boolean existsByAliasNameIgnoreCase(String aliasName);
}
