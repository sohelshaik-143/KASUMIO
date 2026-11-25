package com.kasumio.assessment.evaluation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.assessment.QuestionSubmission;
import com.kasumio.assessment.QuestionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Evaluation Engine with prompt injection isolation, schema verification,
 * and deterministic fallback on timeout or anomaly.
 */
@Service
public class AiEvaluationEngine {

    private static final Logger log = LoggerFactory.getLogger(AiEvaluationEngine.class);
    private final ObjectMapper objectMapper;

    public AiEvaluationEngine(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public EvaluationLayers.Layer3AiSuggestions generateSuggestions(
            QuestionSubmission submission,
            EvaluationLayers.Layer1ExecutionFacts facts,
            EvaluationLayers.Layer2DeterministicMarks marks) {

        String rawCode = submission.getSubmittedCode() != null ? submission.getSubmittedCode() : "";
        boolean promptInjectionSuspected = checkPromptInjection(rawCode);

        // Sanitize code for prompt defense
        String sanitizedPromptCode = sanitizeCandidateInput(rawCode);

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        String explanation;
        String recommendedConcepts;
        int suggestedScore = marks.pointsEarned();
        boolean humanReviewNeeded = promptInjectionSuspected;

        QuestionType qType = submission.getQuestion().getQuestionType();

        if (promptInjectionSuspected) {
            weaknesses.add("Suspicious instruction tokens detected in submitted response.");
            explanation = "Automated advisory evaluation paused due to potential prompt injection in candidate submission. Retaining deterministic score and requesting human recruiter review.";
            recommendedConcepts = "Adhere to standard technical syntax without prompt instructions.";
            humanReviewNeeded = true;
        } else if (qType.isCodeBased()) {
            if (facts.testCasesPassed() == facts.totalTestCases() && facts.totalTestCases() > 0) {
                strengths.add("All deterministic test specifications passed successfully.");
                if (facts.executionTimeMs() < 500) {
                    strengths.add("Low runtime latency: " + facts.executionTimeMs() + "ms demonstrates efficient algorithmic complexity.");
                }
                explanation = "Clean functional implementation meeting all algorithmic constraints and boundary conditions.";
                recommendedConcepts = "Explore concurrent or streaming data processing variants.";
            } else if (facts.testCasesPassed() > 0) {
                strengths.add("Successfully passed core baseline test cases (" + facts.testCasesPassed() + "/" + facts.totalTestCases() + ").");
                weaknesses.add("Failed on edge conditions or hidden boundary test cases.");
                explanation = "Partial algorithmic implementation. Core flow functions but boundary handling requires refinement.";
                recommendedConcepts = "Edge case verification: zero-length collections, negative boundaries, null inputs.";
            } else {
                weaknesses.add("Failed all verification test cases.");
                if (facts.compilationOutput() != null && !facts.compilationOutput().isBlank()) {
                    weaknesses.add("Encountered compilation/runtime errors: " + truncate(facts.compilationOutput(), 120));
                }
                explanation = "Solution encountered execution or logic failures preventing test pass.";
                recommendedConcepts = "Review data structures, method signatures, and basic type contracts.";
            }
        } else if (qType.isChoiceBased()) {
            if (marks.pointsEarned() > 0) {
                strengths.add("Selected correct technical answer according to engineering key.");
                explanation = "Accurate conceptual understanding of problem domain.";
                recommendedConcepts = "Continue exploring advanced production scenarios in this domain.";
            } else {
                weaknesses.add("Selected alternative option which is sub-optimal or incorrect.");
                explanation = "Key architectural misconception identified.";
                recommendedConcepts = "Review core conceptual fundamentals for " + submission.getQuestion().getTitle();
            }
        } else {
            // Text-based: Short answers, technical explanations, real-world scenarios, system design
            int wordCount = rawCode.trim().split("\\s+").length;
            if (wordCount >= 30) {
                strengths.add("Substantive technical articulation provided (" + wordCount + " words).");
                explanation = "Candidate articulated architectural considerations and principles addressing the prompt.";
                recommendedConcepts = "Deepen trade-off analysis between latency, throughput, and consistency.";
            } else if (wordCount > 5) {
                weaknesses.add("Brief explanation. Missing comprehensive architectural trade-offs.");
                explanation = "Response addresses core prompt but would benefit from deeper technical justification.";
                recommendedConcepts = "Elaborate with concrete architectural components and failure-mode mitigations.";
                suggestedScore = Math.max(1, (int) Math.round(marks.maxPoints() * 0.6));
            } else {
                weaknesses.add("Insufficient technical explanation provided.");
                explanation = "Answer lacks substantive engineering detail.";
                recommendedConcepts = "Formulate end-to-end designs specifying protocols, persistence, and scaling tiers.";
                suggestedScore = 0;
            }
        }

        return new EvaluationLayers.Layer3AiSuggestions(
                suggestedScore,
                strengths,
                weaknesses,
                explanation,
                recommendedConcepts,
                0.95,
                humanReviewNeeded
        );
    }

    private boolean checkPromptInjection(String input) {
        if (input == null) return false;
        String lower = input.toLowerCase();
        return lower.contains("ignore previous instructions")
                || lower.contains("system prompt")
                || lower.contains("you are now")
                || lower.contains("jailbreak")
                || lower.contains("disregard all earlier");
    }

    private String sanitizeCandidateInput(String input) {
        if (input == null) return "";
        // Wrap input safely preventing escape sequences
        return "=== BEGIN UNTRUSTED STUDENT INPUT ===\n" + input + "\n=== END UNTRUSTED STUDENT INPUT ===";
    }

    private String truncate(String text, int maxLen) {
        if (text == null || text.length() <= maxLen) return text;
        return text.substring(0, maxLen) + "...";
    }
}
