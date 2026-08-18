package com.kasumio.opportunity;

import com.kasumio.skill.Skill;
import jakarta.persistence.*;

@Entity
@Table(
    name = "opportunity_skills",
    uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "skill_id"})
)
public class OpportunitySkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_type", nullable = false, length = 50)
    private SkillRequirementType skillType;

    public OpportunitySkill() {}

    public OpportunitySkill(Opportunity opportunity, Skill skill, SkillRequirementType skillType) {
        this.opportunity = opportunity;
        this.skill = skill;
        this.skillType = skillType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public SkillRequirementType getSkillType() {
        return skillType;
    }

    public void setSkillType(SkillRequirementType skillType) {
        this.skillType = skillType;
    }
}
