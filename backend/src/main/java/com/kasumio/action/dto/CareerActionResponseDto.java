package com.kasumio.action.dto;

import java.util.List;

public class CareerActionResponseDto {

    private CareerActionDto primaryNextMove;
    private List<CareerActionDto> alternativeMoves;
    private String careerGoalTitle;
    private String primaryEcosystem;

    public CareerActionResponseDto() {}

    public CareerActionResponseDto(CareerActionDto primaryNextMove, List<CareerActionDto> alternativeMoves,
                                  String careerGoalTitle, String primaryEcosystem) {
        this.primaryNextMove = primaryNextMove;
        this.alternativeMoves = alternativeMoves;
        this.careerGoalTitle = careerGoalTitle;
        this.primaryEcosystem = primaryEcosystem;
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
}
