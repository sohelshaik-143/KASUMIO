package com.kasumio.discovery.dto;

import java.util.List;
import java.util.Map;

public class StudentGapReportDto {
    private int totalOpportunitiesAnalyzed;
    private List<PrioritizedGapDto> highPriorityGaps;
    private List<PrioritizedGapDto> mediumPriorityGaps;
    private List<PrioritizedGapDto> lowPriorityGaps;
    private Map<String, Integer> gapsByCategory;

    public StudentGapReportDto() {}

    public StudentGapReportDto(int totalOpportunitiesAnalyzed,
                               List<PrioritizedGapDto> highPriorityGaps,
                               List<PrioritizedGapDto> mediumPriorityGaps,
                               List<PrioritizedGapDto> lowPriorityGaps,
                               Map<String, Integer> gapsByCategory) {
        this.totalOpportunitiesAnalyzed = totalOpportunitiesAnalyzed;
        this.highPriorityGaps = highPriorityGaps;
        this.mediumPriorityGaps = mediumPriorityGaps;
        this.lowPriorityGaps = lowPriorityGaps;
        this.gapsByCategory = gapsByCategory;
    }

    public int getTotalOpportunitiesAnalyzed() { return totalOpportunitiesAnalyzed; }
    public List<PrioritizedGapDto> getHighPriorityGaps() { return highPriorityGaps; }
    public List<PrioritizedGapDto> getMediumPriorityGaps() { return mediumPriorityGaps; }
    public List<PrioritizedGapDto> getLowPriorityGaps() { return lowPriorityGaps; }
    public Map<String, Integer> getGapsByCategory() { return gapsByCategory; }
}
