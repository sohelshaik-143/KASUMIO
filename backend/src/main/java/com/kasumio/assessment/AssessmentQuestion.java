package com.kasumio.assessment;

import com.kasumio.skill.Skill;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assessment_questions")
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false)
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "prompt", columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(name = "points", nullable = false)
    private Integer points = 10;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "validation_status", nullable = false)
    private String validationStatus = "VALIDATED";

    @Column(name = "competency_area")
    private String competencyArea;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AssessmentQuestion() {}

    public AssessmentQuestion(Assessment assessment, QuestionType questionType, DifficultyLevel difficulty,
                              Skill skill, String title, String prompt, Integer points, Integer orderIndex) {
        this.assessment = assessment;
        this.questionType = questionType;
        this.difficulty = difficulty != null ? difficulty : DifficultyLevel.MEDIUM;
        this.skill = skill;
        this.title = title;
        this.prompt = prompt;
        this.points = points != null ? points : 10;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
        this.validationStatus = "VALIDATED";
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public String getValidationStatus() { return validationStatus; }
    public void setValidationStatus(String validationStatus) { this.validationStatus = validationStatus; }

    public String getCompetencyArea() { return competencyArea; }
    public void setCompetencyArea(String competencyArea) { this.competencyArea = competencyArea; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
