package com.kasumio.assessment;

import jakarta.persistence.*;

@Entity
@Table(name = "question_options")
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "option_text", columnDefinition = "TEXT", nullable = false)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    public QuestionOption() {}

    public QuestionOption(AssessmentQuestion question, String optionText, Boolean isCorrect, String explanation, Integer orderIndex) {
        this.question = question;
        this.optionText = optionText;
        this.isCorrect = isCorrect != null ? isCorrect : false;
        this.explanation = explanation;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssessmentQuestion getQuestion() { return question; }
    public void setQuestion(AssessmentQuestion question) { this.question = question; }

    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }

    public Boolean getIsCorrect() { return isCorrect; }
    public boolean isCorrect() { return Boolean.TRUE.equals(isCorrect); }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
