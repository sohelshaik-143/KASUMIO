package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import jakarta.persistence.*;

@Entity
@Table(name = "skill_relationships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"source_skill_id", "target_skill_id", "relationship_type"}))
public class SkillRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_skill_id", nullable = false)
    private Skill sourceSkill;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_skill_id", nullable = false)
    private Skill targetSkill;

    @Column(name = "relationship_type", nullable = false, length = 50)
    private String relationshipType; // PARENT, CHILD, PREREQUISITE, RELATED, SUCCESSOR

    @Column(nullable = false)
    private double strength = 0.5;

    public SkillRelationship() {}

    public SkillRelationship(Skill sourceSkill, Skill targetSkill, String relationshipType, double strength) {
        this.sourceSkill = sourceSkill;
        this.targetSkill = targetSkill;
        this.relationshipType = relationshipType;
        this.strength = strength;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Skill getSourceSkill() { return sourceSkill; }
    public void setSourceSkill(Skill sourceSkill) { this.sourceSkill = sourceSkill; }
    public Skill getTargetSkill() { return targetSkill; }
    public void setTargetSkill(Skill targetSkill) { this.targetSkill = targetSkill; }
    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }
    public double getStrength() { return strength; }
    public void setStrength(double strength) { this.strength = strength; }
}
