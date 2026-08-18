package com.kasumio.discovery.dto;

import java.util.List;

/**
 * Technology Graph Payload (Graph 1 — Career Capability Map)
 * Contains nodes and edges computed on Java backend with factual evidence flags.
 */
public class TechnologyGraphDto {

    public static class GraphNode {
        private Long id;
        private String name;
        private String category;
        private String subcategory;
        private String ecosystem;
        private String possessionStatus; // VERIFIED, STRONG, MODERATE, INFERRED, MISSING
        private double confidence;
        private int opportunityDemandCount;

        public GraphNode() {}

        public GraphNode(Long id, String name, String category, String subcategory,
                         String ecosystem, String possessionStatus, double confidence,
                         int opportunityDemandCount) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.subcategory = subcategory;
            this.ecosystem = ecosystem;
            this.possessionStatus = possessionStatus;
            this.confidence = confidence;
            this.opportunityDemandCount = opportunityDemandCount;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getCategory() { return category; }
        public String getSubcategory() { return subcategory; }
        public String getEcosystem() { return ecosystem; }
        public String getPossessionStatus() { return possessionStatus; }
        public double getConfidence() { return confidence; }
        public int getOpportunityDemandCount() { return opportunityDemandCount; }
    }

    public static class GraphEdge {
        private Long sourceId;
        private Long targetId;
        private String relationshipType; // PARENT, CHILD, PREREQUISITE, RELATED, SUCCESSOR
        private double strength;

        public GraphEdge() {}

        public GraphEdge(Long sourceId, Long targetId, String relationshipType, double strength) {
            this.sourceId = sourceId;
            this.targetId = targetId;
            this.relationshipType = relationshipType;
            this.strength = strength;
        }

        public Long getSourceId() { return sourceId; }
        public Long getTargetId() { return targetId; }
        public String getRelationshipType() { return relationshipType; }
        public double getStrength() { return strength; }
    }

    private List<GraphNode> nodes;
    private List<GraphEdge> edges;
    private int totalSkillsCount;
    private int studentPossessedCount;

    public TechnologyGraphDto() {}

    public TechnologyGraphDto(List<GraphNode> nodes, List<GraphEdge> edges, int totalSkillsCount, int studentPossessedCount) {
        this.nodes = nodes;
        this.edges = edges;
        this.totalSkillsCount = totalSkillsCount;
        this.studentPossessedCount = studentPossessedCount;
    }

    public List<GraphNode> getNodes() { return nodes; }
    public List<GraphEdge> getEdges() { return edges; }
    public int getTotalSkillsCount() { return totalSkillsCount; }
    public int getStudentPossessedCount() { return studentPossessedCount; }
}
