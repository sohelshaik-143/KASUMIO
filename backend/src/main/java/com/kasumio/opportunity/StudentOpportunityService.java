package com.kasumio.opportunity;

import com.kasumio.common.SecurityUtils;
import com.kasumio.opportunity.dto.StudentOpportunityResponse;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentOpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityInterestRepository interestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MatchingEngineService matchingEngineService;

    public StudentOpportunityService(
            OpportunityRepository opportunityRepository,
            OpportunityInterestRepository interestRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            MatchingEngineService matchingEngineService) {
        this.opportunityRepository = opportunityRepository;
        this.interestRepository = interestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.matchingEngineService = matchingEngineService;
    }

    @Transactional(readOnly = true)
    public List<StudentOpportunityResponse> getRelevantOpportunities() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        List<Opportunity> publishedOpps = opportunityRepository.findPublishedWithSkills(OpportunityStatus.PUBLISHED);

        return publishedOpps.stream()
                .map(opp -> matchingEngineService.evaluateStudentRelevance(opp, student))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    @Transactional
    public void expressInterest(Long opportunityId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot express interest in an unpublished or closed opportunity");
        }

        Optional<OpportunityInterest> existingOpt = interestRepository.findByOpportunityAndStudent(opp, student);
        if (existingOpt.isPresent()) {
            OpportunityInterest interest = existingOpt.get();
            if (interest.getStatus() == InterestStatus.INTERESTED) {
                // Rule: Return HTTP 409 when attempting to create a duplicate active interest
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already expressed interest in this opportunity");
            }
            interest.setStatus(InterestStatus.INTERESTED);
            interestRepository.save(interest);
        } else {
            OpportunityInterest newInterest = new OpportunityInterest(opp, student, InterestStatus.INTERESTED);
            interestRepository.save(newInterest);
        }
    }

    @Transactional
    public void withdrawInterest(Long opportunityId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        OpportunityInterest interest = interestRepository.findByOpportunityAndStudent(opp, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No interest record found for this opportunity"));

        interest.setStatus(InterestStatus.WITHDRAWN);
        interestRepository.save(interest);
    }
}
