package com.kasumio.action;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutcomeDecisionTraceRepository extends JpaRepository<OutcomeDecisionTrace, Long> {
    List<OutcomeDecisionTrace> findByStudentOrderByCreatedAtDesc(Student student);
    List<OutcomeDecisionTrace> findByStudentAndTargetSkillNameOrderByCreatedAtDesc(Student student, String targetSkillName);
}
