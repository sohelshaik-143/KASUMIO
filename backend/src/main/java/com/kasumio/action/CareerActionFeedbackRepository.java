package com.kasumio.action;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerActionFeedbackRepository extends JpaRepository<CareerActionFeedback, Long> {
    List<CareerActionFeedback> findByStudentOrderByCreatedAtDesc(Student student);
    boolean existsByStudentAndActionId(Student student, String actionId);
}
