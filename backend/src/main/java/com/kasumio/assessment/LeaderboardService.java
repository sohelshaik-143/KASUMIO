package com.kasumio.assessment;

import com.kasumio.assessment.dto.LeaderboardEntryDto;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.opportunity.CandidateAliasService;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Leaderboard Service
 * 
 * Aggregates real assessment metrics (problems solved, accuracy, verified skills, difficulty handled).
 * Enforces privacy controls so candidates control their public visibility.
 * Never uses fake users or synthetic rankings.
 */
@Service
public class LeaderboardService {

    private final AssessmentAttemptRepository attemptRepository;
    private final QuestionSubmissionRepository submissionRepository;
    private final EvidenceRepository evidenceRepository;
    private final StudentRepository studentRepository;
    private final CandidateAliasService candidateAliasService;

    public LeaderboardService(AssessmentAttemptRepository attemptRepository,
                              QuestionSubmissionRepository submissionRepository,
                              EvidenceRepository evidenceRepository,
                              StudentRepository studentRepository,
                              CandidateAliasService candidateAliasService) {
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.evidenceRepository = evidenceRepository;
        this.studentRepository = studentRepository;
        this.candidateAliasService = candidateAliasService;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard(String skillFilter, String universityFilter) {
        List<AssessmentAttempt> completedAttempts = attemptRepository.findPublicCompletedAttempts();

        // Group completed attempts by student
        Map<Student, List<AssessmentAttempt>> byStudent = completedAttempts.stream()
                .collect(Collectors.groupingBy(AssessmentAttempt::getStudent));

        List<LeaderboardEntryDto> entries = new ArrayList<>();

        for (Map.Entry<Student, List<AssessmentAttempt>> entry : byStudent.entrySet()) {
            Student student = entry.getKey();
            List<AssessmentAttempt> attempts = entry.getValue();

            // Filter by university if specified
            if (universityFilter != null && !universityFilter.isBlank()) {
                if (student.getUniversity() == null || !student.getUniversity().equalsIgnoreCase(universityFilter.trim())) {
                    continue;
                }
            }

            // Get all verified evidence badges
            List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
            List<String> verifiedSkillBadges = studentEvidence.stream()
                    .filter(e -> e.getSkill() != null)
                    .map(e -> e.getSkill().getName())
                    .distinct()
                    .collect(Collectors.toList());

            // Filter by skill if specified
            if (skillFilter != null && !skillFilter.isBlank()) {
                boolean hasSkill = verifiedSkillBadges.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(skillFilter.trim()));
                if (!hasSkill) {
                    continue;
                }
            }

            int totalScore = attempts.stream().mapToInt(AssessmentAttempt::getScore).sum();
            int maxTotalScore = attempts.stream().mapToInt(AssessmentAttempt::getMaxScore).sum();
            int assessmentsCompleted = attempts.size();

            // Calculate problems solved & accuracy from submissions
            int problemsSolved = 0;
            int totalSubmissions = 0;
            Instant latestActive = Instant.EPOCH;

            for (AssessmentAttempt att : attempts) {
                if (att.getCompletedAt() != null && att.getCompletedAt().isAfter(latestActive)) {
                    latestActive = att.getCompletedAt();
                }
                List<QuestionSubmission> subs = submissionRepository.findByAttemptOrderByCreatedAtAsc(att);
                for (QuestionSubmission sub : subs) {
                    totalSubmissions++;
                    if (sub.getStatus() == SubmissionStatus.PASSED) {
                        problemsSolved++;
                    }
                }
            }

            double accuracy = totalSubmissions > 0
                    ? ((double) problemsSolved / totalSubmissions) * 100.0
                    : (maxTotalScore > 0 ? ((double) totalScore / maxTotalScore) * 100.0 : 0.0);

            // Determine highest difficulty handled
            boolean hasHard = attempts.stream().anyMatch(a -> a.getAdaptiveDifficulty() == DifficultyLevel.HARD);
            boolean hasMedium = attempts.stream().anyMatch(a -> a.getAdaptiveDifficulty() == DifficultyLevel.MEDIUM);
            String highestDifficulty = hasHard ? "HARD" : (hasMedium ? "MEDIUM" : "EASY");

            String alias = candidateAliasService.getOrCreateAlias(student);

            entries.add(new LeaderboardEntryDto(
                    0, // will be ranked after sorting
                    student.getId(),
                    "Candidate #" + alias,
                    student.getUniversity() != null ? student.getUniversity() : "Self-Taught / Independent",
                    totalScore,
                    problemsSolved,
                    assessmentsCompleted,
                    Math.round(accuracy * 10.0) / 10.0,
                    highestDifficulty,
                    verifiedSkillBadges,
                    latestActive
            ));
        }

        // Sort descending by total score, then by problems solved, then by accuracy
        entries.sort((a, b) -> {
            int cmp = Integer.compare(b.getTotalScore(), a.getTotalScore());
            if (cmp != 0) return cmp;
            cmp = Integer.compare(b.getProblemsSolved(), a.getProblemsSolved());
            if (cmp != 0) return cmp;
            return Double.compare(b.getOverallAccuracy(), a.getOverallAccuracy());
        });

        // Assign rank numbers
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }

    @Transactional
    public boolean updatePrivacy(Student student, boolean isPublic) {
        student.setLeaderboardPublic(isPublic);
        studentRepository.save(student);
        return isPublic;
    }

    @Transactional(readOnly = true)
    public boolean getPrivacyStatus(Student student) {
        return student.getLeaderboardPublic();
    }
}
