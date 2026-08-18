package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import jakarta.persistence.*;

@Entity
@Table(name = "skill_aliases", uniqueConstraints = @UniqueConstraint(columnNames = "alias_name"))
public class SkillAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alias_name", nullable = false, length = 100)
    private String aliasName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    public SkillAlias() {}

    public SkillAlias(String aliasName, Skill skill) {
        this.aliasName = aliasName;
        this.skill = skill;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAliasName() { return aliasName; }
    public void setAliasName(String aliasName) { this.aliasName = aliasName; }
    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
}
