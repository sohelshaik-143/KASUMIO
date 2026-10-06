package com.kasumio.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    Optional<CodingProblem> findByQuestion(AssessmentQuestion question);
    Optional<CodingProblem> findByQuestionId(Long questionId);
}
