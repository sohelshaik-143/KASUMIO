package com.kasumio.assessment;

public enum QuestionType {
    // Existing base types
    CODING,
    DEBUGGING,
    MCQ,
    SQL,
    CONCEPTUAL,
    // Task 3 extended question types
    DSA_CODING,
    IMPLEMENTATION,
    SHORT_ANSWER,
    TECHNICAL_EXPLANATION,
    REAL_WORLD_SCENARIO,
    BACKEND_ENGINEERING,
    SYSTEM_DESIGN;

    public boolean isCodeBased() {
        return this == CODING || this == DEBUGGING || this == DSA_CODING
                || this == IMPLEMENTATION || this == SQL || this == BACKEND_ENGINEERING;
    }

    public boolean isChoiceBased() {
        return this == MCQ;
    }

    public boolean isTextBased() {
        return this == CONCEPTUAL || this == SHORT_ANSWER || this == TECHNICAL_EXPLANATION
                || this == REAL_WORLD_SCENARIO || this == SYSTEM_DESIGN;
    }
}
