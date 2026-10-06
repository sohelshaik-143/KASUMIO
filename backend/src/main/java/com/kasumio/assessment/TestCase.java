package com.kasumio.assessment;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_problem_id", nullable = false)
    private CodingProblem codingProblem;

    @Column(name = "input_data", columnDefinition = "TEXT", nullable = false)
    private String inputData;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "is_hidden", nullable = false)
    private Boolean isHidden = false;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    public TestCase() {}

    public TestCase(CodingProblem codingProblem, String inputData, String expectedOutput, Boolean isHidden, String explanation, Integer orderIndex) {
        this.codingProblem = codingProblem;
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
        this.isHidden = isHidden != null ? isHidden : false;
        this.explanation = explanation;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CodingProblem getCodingProblem() { return codingProblem; }
    public void setCodingProblem(CodingProblem codingProblem) { this.codingProblem = codingProblem; }

    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
