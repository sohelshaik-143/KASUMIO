package com.kasumio.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionSubmissionRepository extends JpaRepository<QuestionSubmission, Long> {
    List<QuestionSubmission> findByAttemptOrderByCreatedAtAsc(AssessmentAttempt attempt);
    List<QuestionSubmission> findByAttemptIdOrderByCreatedAtAsc(Long attemptId);
    Optional<QuestionSubmission> findFirstByAttemptIdAndQuestionIdOrderByCreatedAtDesc(Long attemptId, Long questionId);
    Optional<QuestionSubmission> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
