package com.kasumio.action;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerActionHistoryRepository extends JpaRepository<CareerActionHistory, Long> {
    List<CareerActionHistory> findByStudentOrderByCreatedAtDesc(Student student);
    List<CareerActionHistory> findByStudentAndStatus(Student student, String status);
    Optional<CareerActionHistory> findFirstByStudentAndActionIdOrderByCreatedAtDesc(Student student, String actionId);
    boolean existsByStudentAndTargetSkillNameAndStatus(Student student, String targetSkillName, String status);
    boolean existsByStudentAndActionIdAndStatus(Student student, String actionId, String status);
}
