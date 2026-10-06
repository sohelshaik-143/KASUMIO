package com.kasumio.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByCodingProblemOrderByOrderIndexAsc(CodingProblem codingProblem);
    List<TestCase> findByCodingProblemIdOrderByOrderIndexAsc(Long codingProblemId);
    List<TestCase> findByCodingProblemIdAndIsHiddenFalseOrderByOrderIndexAsc(Long codingProblemId);
}
