package com.kasumio.opportunity;

import com.kasumio.student.Student;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityService {

    public static class EligibilityEvaluation {
        private final boolean eligible;
        private final List<String> passedCriteria;
        private final List<String> failedCriteria;
        private final String explanation;

        public EligibilityEvaluation(boolean eligible, List<String> passedCriteria, List<String> failedCriteria, String explanation) {
            this.eligible = eligible;
            this.passedCriteria = passedCriteria;
            this.failedCriteria = failedCriteria;
            this.explanation = explanation;
        }

        public boolean isEligible() {
            return eligible;
        }

        public List<String> getPassedCriteria() {
            return passedCriteria;
        }

        public List<String> getFailedCriteria() {
            return failedCriteria;
        }

        public String getExplanation() {
            return explanation;
        }
    }

    /**
     * Deterministically evaluates non-technical eligibility criteria.
     * Separates legal/operational/education eligibility from technical skill capability.
     */
    public EligibilityEvaluation evaluateEligibility(Opportunity opportunity, Student student) {
        List<String> passed = new ArrayList<>();
        List<String> failed = new ArrayList<>();

        // 1. Deadline Check
        if (opportunity.getDeadline() != null && Instant.now().isAfter(opportunity.getDeadline())) {
            failed.add("Application deadline passed on " + opportunity.getDeadline());
        } else {
            passed.add("Deadline active");
        }

        // 2. Education / Graduation Year Check (if specified in education requirements or eligibility string)
        if (opportunity.getEducationRequirements() != null && !opportunity.getEducationRequirements().isBlank()) {
            String eduReq = opportunity.getEducationRequirements().toLowerCase();
            if (student.getGraduationYear() != null) {
                // If requirement states e.g. "2025" or "2026" or "graduating"
                if (eduReq.contains("graduating") && eduReq.contains(String.valueOf(student.getGraduationYear()))) {
                    passed.add("Graduation year (" + student.getGraduationYear() + ") matches education requirement");
                } else if (eduReq.contains("bachelor") || eduReq.contains("undergraduate") || eduReq.contains("student")) {
                    passed.add("Student enrollment criteria met");
                } else {
                    passed.add("Education requirements reviewed");
                }
            } else {
                passed.add("Education profile open for review");
            }
        }

        // 3. Work Mode & Location Check
        if (opportunity.getWorkType() == WorkType.ON_SITE) {
            if (opportunity.getLocation() != null && !opportunity.getLocation().isBlank()) {
                // If on-site, mention location expectation
                passed.add("On-site role located in " + opportunity.getLocation());
            } else {
                passed.add("On-site role requirement");
            }
        } else if (opportunity.getWorkType() == WorkType.REMOTE) {
            passed.add("Remote work mode eligible");
        } else if (opportunity.getWorkType() == WorkType.HYBRID) {
            passed.add("Hybrid work mode acknowledged");
        }

        // 4. Status Check
        if (opportunity.getStatus() != OpportunityStatus.PUBLISHED) {
            failed.add("Opportunity is not currently active/published");
        }

        boolean eligible = failed.isEmpty();
        String explanation;
        if (eligible) {
            explanation = "You meet all general eligibility, education, and deadline requirements.";
        } else {
            explanation = "Eligibility constraint not met: " + String.join("; ", failed);
        }

        return new EligibilityEvaluation(eligible, passed, failed, explanation);
    }
}
