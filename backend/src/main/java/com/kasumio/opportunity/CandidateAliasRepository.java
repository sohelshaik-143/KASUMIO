package com.kasumio.opportunity;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CandidateAliasRepository extends JpaRepository<CandidateAlias, Long> {
    Optional<CandidateAlias> findByStudent(Student student);
    Optional<CandidateAlias> findByStudentId(Long studentId);
    Optional<CandidateAlias> findByPublicAlias(String publicAlias);
    boolean existsByPublicAlias(String publicAlias);
}
