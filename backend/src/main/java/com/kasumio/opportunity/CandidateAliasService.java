package com.kasumio.opportunity;

import com.kasumio.student.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CandidateAliasService {

    private final CandidateAliasRepository candidateAliasRepository;

    public CandidateAliasService(CandidateAliasRepository candidateAliasRepository) {
        this.candidateAliasRepository = candidateAliasRepository;
    }

    @Transactional
    public String getOrCreateAlias(Student student) {
        return candidateAliasRepository.findByStudent(student)
                .map(CandidateAlias::getPublicAlias)
                .orElseGet(() -> {
                    long count = candidateAliasRepository.count() + 1;
                    String alias = String.format("KSM-CAND-%03d", count);
                    
                    // Handle rare collisions
                    while (candidateAliasRepository.existsByPublicAlias(alias)) {
                        count++;
                        alias = String.format("KSM-CAND-%03d", count);
                    }

                    CandidateAlias newAlias = new CandidateAlias(student, alias);
                    candidateAliasRepository.save(newAlias);
                    return alias;
                });
    }

    @Transactional(readOnly = true)
    public Optional<Student> findStudentByAlias(String publicAlias) {
        return candidateAliasRepository.findByPublicAlias(publicAlias)
                .map(CandidateAlias::getStudent);
    }
}
