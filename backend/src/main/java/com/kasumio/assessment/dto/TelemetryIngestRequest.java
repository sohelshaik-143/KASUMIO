package com.kasumio.assessment.dto;

/**
 * Real-time non-punitive assessment signals telemetry payload.
 */
public class TelemetryIngestRequest {

    private Long questionId;
    private Integer focusChangeCount = 0;
    private Integer pasteCount = 0;
    private Integer keystrokeCount = 0;
    private Integer largeChangesCount = 0;
    private Long timeSpentSeconds = 0L;

    public TelemetryIngestRequest() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

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
