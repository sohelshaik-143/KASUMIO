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
    private String eventType; // "BLUR", "FOCUS", "PASTE", "HEARTBEAT", "SUSTAINED_BLUR"
    private String eventDetail;
    private Long blurDurationMs;

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

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventDetail() { return eventDetail; }
    public void setEventDetail(String eventDetail) { this.eventDetail = eventDetail; }

    public Long getBlurDurationMs() { return blurDurationMs; }
    public void setBlurDurationMs(Long blurDurationMs) { this.blurDurationMs = blurDurationMs; }
}
