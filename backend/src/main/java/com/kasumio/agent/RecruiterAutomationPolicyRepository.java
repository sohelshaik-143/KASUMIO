package com.kasumio.agent;

import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecruiterAutomationPolicyRepository extends JpaRepository<RecruiterAutomationPolicy, Long> {
    Optional<RecruiterAutomationPolicy> findByRecruiter(User recruiter);
}
