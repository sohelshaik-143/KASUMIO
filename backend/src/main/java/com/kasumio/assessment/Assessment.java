package com.kasumio.assessment;

import com.kasumio.opportunity.Opportunity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes = 45;

    @Column(name = "passing_score", nullable = false)
    private Integer passingScore = 70;

    @Column(name = "blueprint_json", columnDefinition = "TEXT")
    private String blueprintJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssessmentStatus status = AssessmentStatus.DRAFT;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks = 0;

    @Column(name = "skill_weightings_json", columnDefinition = "TEXT")
    private String skillWeightingsJson;

    @Column(name = "passing_criteria")
    private String passingCriteria;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Assessment() {}

    public Assessment(Opportunity opportunity, String title, String description, Integer timeLimitMinutes, Integer passingScore, String blueprintJson) {
        this.opportunity = opportunity;
        this.title = title;
        this.description = description;
        this.timeLimitMinutes = timeLimitMinutes != null ? timeLimitMinutes : 45;
        this.passingScore = passingScore != null ? passingScore : 70;
        this.blueprintJson = blueprintJson;
        this.status = AssessmentStatus.DRAFT;
        this.versionNumber = 1;
        this.totalMarks = 0;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Opportunity getOpportunity() { return opportunity; }
    public void setOpportunity(Opportunity opportunity) { this.opportunity = opportunity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }

    public String getBlueprintJson() { return blueprintJson; }
    public void setBlueprintJson(String blueprintJson) { this.blueprintJson = blueprintJson; }

    public AssessmentStatus getStatus() { return status; }
    public void setStatus(AssessmentStatus status) { this.status = status; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public String getSkillWeightingsJson() { return skillWeightingsJson; }
    public void setSkillWeightingsJson(String skillWeightingsJson) { this.skillWeightingsJson = skillWeightingsJson; }

    public String getPassingCriteria() { return passingCriteria; }
    public void setPassingCriteria(String passingCriteria) { this.passingCriteria = passingCriteria; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
