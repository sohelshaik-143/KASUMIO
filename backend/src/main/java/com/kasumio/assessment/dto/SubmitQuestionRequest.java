package com.kasumio.assessment.dto;

public class SubmitQuestionRequest {
    private Long questionId;
    private String language;
    private String code;
    private Long selectedOptionId;
    private Integer focusChangeCount = 0;
    private Integer pasteCount = 0;
    private Integer keystrokeCount = 0;
    private Integer largeChangesCount = 0;
    private Long timeSpentSeconds = 0L;

    public SubmitQuestionRequest() {}

    public SubmitQuestionRequest(Long questionId, String language, String code, Long selectedOptionId) {
        this.questionId = questionId;
        this.language = language;
        this.code = code;
        this.selectedOptionId = selectedOptionId;
    }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Long getSelectedOptionId() { return selectedOptionId; }
    public void setSelectedOptionId(Long selectedOptionId) { this.selectedOptionId = selectedOptionId; }
    public Integer getFocusChangeCount() { return focusChangeCount; }
    public void setFocusChangeCount(Integer focusChangeCount) { this.focusChangeCount = focusChangeCount; }
    public Integer getPasteCount() { return pasteCount; }
    public void setPasteCount(Integer pasteCount) { this.pasteCount = pasteCount; }
    public Integer getKeystrokeCount() { return keystrokeCount; }
    public void setKeystrokeCount(Integer keystrokeCount) { this.keystrokeCount = keystrokeCount; }
    public Integer getLargeChangesCount() { return largeChangesCount; }
    public void setLargeChangesCount(Integer largeChangesCount) { this.largeChangesCount = largeChangesCount; }
    public Long getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(Long timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
}
