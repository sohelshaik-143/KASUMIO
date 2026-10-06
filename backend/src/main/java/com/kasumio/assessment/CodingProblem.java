package com.kasumio.assessment;

import jakarta.persistence.*;

@Entity
@Table(name = "coding_problems")
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private AssessmentQuestion question;

    @Column(name = "problem_statement", columnDefinition = "TEXT", nullable = false)
    private String problemStatement;

    @Column(name = "starter_code_json", columnDefinition = "TEXT", nullable = false)
    private String starterCodeJson;

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "allowed_languages", nullable = false)
    private String allowedLanguages = "java,python,javascript,typescript,cpp,go,rust,kotlin";

    @Column(name = "time_limit_ms", nullable = false)
    private Integer timeLimitMs = 4000;

    @Column(name = "memory_limit_mb", nullable = false)
    private Integer memoryLimitMb = 256;

    public CodingProblem() {}

    public CodingProblem(AssessmentQuestion question, String problemStatement, String starterCodeJson,
                         String constraints, String allowedLanguages, Integer timeLimitMs, Integer memoryLimitMb) {
        this.question = question;
        this.problemStatement = problemStatement;
        this.starterCodeJson = starterCodeJson;
        this.constraints = constraints;
        this.allowedLanguages = allowedLanguages != null ? allowedLanguages : "java,python,javascript,typescript,cpp,go,rust,kotlin";
        this.timeLimitMs = timeLimitMs != null ? timeLimitMs : 4000;
        this.memoryLimitMb = memoryLimitMb != null ? memoryLimitMb : 256;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssessmentQuestion getQuestion() { return question; }
    public void setQuestion(AssessmentQuestion question) { this.question = question; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getStarterCodeJson() { return starterCodeJson; }
    public void setStarterCodeJson(String starterCodeJson) { this.starterCodeJson = starterCodeJson; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public String getAllowedLanguages() { return allowedLanguages; }
    public void setAllowedLanguages(String allowedLanguages) { this.allowedLanguages = allowedLanguages; }

    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }

    public Integer getMemoryLimitMb() { return memoryLimitMb; }
    public void setMemoryLimitMb(Integer memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }
}
