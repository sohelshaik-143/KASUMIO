package com.kasumio.assessment;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface CandidateQuestionHistoryRepository extends JpaRepository<CandidateQuestionHistory, Long> {

    @Query("SELECT h.question.id FROM CandidateQuestionHistory h WHERE h.student = :student")
    Set<Long> findAttemptedQuestionIdsByStudent(@Param("student") Student student);

    List<CandidateQuestionHistory> findByStudentOrderByAttemptedAtDesc(Student student);

    boolean existsByStudentAndQuestion(Student student, AssessmentQuestion question);
}
