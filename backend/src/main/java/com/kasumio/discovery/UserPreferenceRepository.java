package com.kasumio.discovery;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    List<UserPreference> findByStudent(Student student);
    Optional<UserPreference> findByStudentAndPreferenceKeyAndPreferenceValue(Student student, String preferenceKey, String preferenceValue);
}
