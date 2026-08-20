package com.kasumio.action.dto;

import java.util.List;

public class CareerActionResponseDto {

    private CareerActionDto primaryNextMove;
    private List<CareerActionDto> alternativeMoves;
    private String careerGoalTitle;
    private String primaryEcosystem;
    private String confidenceLevel = "HIGH";
    private boolean insufficientEvidence = false;
    private String confidenceMessage;
    private VisualFlowDto visualFlow;

    public CareerActionResponseDto() {}

    public CareerActionResponseDto(CareerActionDto primaryNextMove, List<CareerActionDto> alternativeMoves,
                                  String careerGoalTitle, String primaryEcosystem) {
        this.primaryNextMove = primaryNextMove;
        this.alternativeMoves = alternativeMoves;
        this.careerGoalTitle = careerGoalTitle;
        this.primaryEcosystem = primaryEcosystem;
    }

    public CareerActionResponseDto(CareerActionDto primaryNextMove, List<CareerActionDto> alternativeMoves,
                                  String careerGoalTitle, String primaryEcosystem, String confidenceLevel,
                                  boolean insufficientEvidence, String confidenceMessage, VisualFlowDto visualFlow) {
        this.primaryNextMove = primaryNextMove;
        this.alternativeMoves = alternativeMoves;
        this.careerGoalTitle = careerGoalTitle;
        this.primaryEcosystem = primaryEcosystem;
        this.confidenceLevel = confidenceLevel;
        this.insufficientEvidence = insufficientEvidence;
        this.confidenceMessage = confidenceMessage;
        this.visualFlow = visualFlow;
    }

    public CareerActionDto getPrimaryNextMove() {
        return primaryNextMove;
    }

    public void setPrimaryNextMove(CareerActionDto primaryNextMove) {
        this.primaryNextMove = primaryNextMove;
    }

    public List<CareerActionDto> getAlternativeMoves() {
        return alternativeMoves;
    }

    public void setAlternativeMoves(List<CareerActionDto> alternativeMoves) {
        this.alternativeMoves = alternativeMoves;
    }

    public String getCareerGoalTitle() {
        return careerGoalTitle;
    }

    public void setCareerGoalTitle(String careerGoalTitle) {
        this.careerGoalTitle = careerGoalTitle;
    }

    public String getPrimaryEcosystem() {
        return primaryEcosystem;
    }

    public void setPrimaryEcosystem(String primaryEcosystem) {
        this.primaryEcosystem = primaryEcosystem;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(String confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public boolean isInsufficientEvidence() {
        return insufficientEvidence;
    }

    public void setInsufficientEvidence(boolean insufficientEvidence) {
        this.insufficientEvidence = insufficientEvidence;
    }

    public String getConfidenceMessage() {
        return confidenceMessage;
    }

    public void setConfidenceMessage(String confidenceMessage) {
        this.confidenceMessage = confidenceMessage;
    }

    public VisualFlowDto getVisualFlow() {
        return visualFlow;
    }

    public void setVisualFlow(VisualFlowDto visualFlow) {
        this.visualFlow = visualFlow;
    }
}
