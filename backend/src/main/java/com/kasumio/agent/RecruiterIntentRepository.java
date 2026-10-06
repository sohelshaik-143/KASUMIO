package com.kasumio.agent;

import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterIntentRepository extends JpaRepository<RecruiterIntent, Long> {
    List<RecruiterIntent> findByRecruiterOrderByCreatedAtDesc(User recruiter);
}
