package com.kasumio.agent.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ApproveAndExecuteRequest {
    private List<String> approvedAliases = new ArrayList<>();
    private Map<String, String> customOutreachNotes = new HashMap<>();
    private boolean publishImmediately = true;

    public ApproveAndExecuteRequest() {}

    public List<String> getApprovedAliases() { return approvedAliases; }
    public void setApprovedAliases(List<String> approvedAliases) { this.approvedAliases = approvedAliases; }
    public Map<String, String> getCustomOutreachNotes() { return customOutreachNotes; }
    public void setCustomOutreachNotes(Map<String, String> customOutreachNotes) { this.customOutreachNotes = customOutreachNotes; }
    public boolean isPublishImmediately() { return publishImmediately; }
    public void setPublishImmediately(boolean publishImmediately) { this.publishImmediately = publishImmediately; }
}
