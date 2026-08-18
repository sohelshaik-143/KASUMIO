package com.kasumio.goal;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CareerGoalRepository extends JpaRepository<CareerGoal, Long> {
    List<CareerGoal> findByStudentOrderByTitleAsc(Student student);
    List<CareerGoal> findByStudentId(Long studentId);
    Optional<CareerGoal> findByIdAndStudent(Long id, Student student);
    long countByStudent(Student student);
}
