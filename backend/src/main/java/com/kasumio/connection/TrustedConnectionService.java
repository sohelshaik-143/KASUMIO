package com.kasumio.connection;

import com.kasumio.common.SecurityUtils;
import com.kasumio.connection.dto.*;
import com.kasumio.opportunity.*;
import com.kasumio.opportunity.dto.CandidateMatchResponse;
import com.kasumio.opportunity.dto.SkillRequirementDto;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TrustedConnectionService {

    private final TrustedConnectionRepository trustedConnectionRepository;
    private final OpportunityRepository opportunityRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CandidateAliasService candidateAliasService;
    private final MatchingEngineService matchingEngineService;

    public TrustedConnectionService(
            TrustedConnectionRepository trustedConnectionRepository,
            OpportunityRepository opportunityRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            CandidateAliasService candidateAliasService,
            MatchingEngineService matchingEngineService) {
        this.trustedConnectionRepository = trustedConnectionRepository;
        this.opportunityRepository = opportunityRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.candidateAliasService = candidateAliasService;
        this.matchingEngineService = matchingEngineService;
    }

    @Transactional
    public RecruiterConnectionResponse requestConnection(Long opportunityId, String candidateAlias, ConnectionRequestDto request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters or administrators can request trusted connections");
        }

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot request connection for an unpublished or closed opportunity");
        }

        Student student = candidateAliasService.findStudentByAlias(candidateAlias)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate alias not found"));

        // Validate candidate actually matches opportunity (min 50% required threshold)
        List<CandidateMatchResponse> matches = matchingEngineService.findMatchesForOpportunity(opp);
        boolean isMatched = matches.stream().anyMatch(m -> m.getCandidateAlias().equals(candidateAlias));
        if (!isMatched) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate does not meet the demonstrable evidence match criteria for this opportunity");
        }

        Optional<TrustedConnection> existingOpt = trustedConnectionRepository.findByOpportunityAndStudent(opp, student);
        TrustedConnection connection;

        if (existingOpt.isPresent()) {
            connection = existingOpt.get();
            if (connection.getStatus() == ConnectionStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A trusted connection is already established with this candidate");
            }
            if (connection.getStatus() == ConnectionStatus.PENDING && !connection.isExpired()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A connection request is already pending with this candidate");
            }

            // Re-open request if expired, declined, or cancelled
            connection.setStatus(ConnectionStatus.PENDING);
            connection.setCreatedAt(Instant.now());
            connection.setExpiresAt(Instant.now().plus(14, ChronoUnit.DAYS));
            connection.setRespondedAt(null);
            connection.setRecruiterNote(request != null && request.getRecruiterNote() != null ? request.getRecruiterNote().trim() : null);
            connection.setShareFullName(false);
            connection.setShareEmail(false);
            connection.setShareBio(false);
            connection.setShareUniversity(false);
            connection.setShareGraduationYear(false);
            connection.setCustomMessage(null);
            connection = trustedConnectionRepository.save(connection);
        } else {
            String note = (request != null && request.getRecruiterNote() != null) ? request.getRecruiterNote().trim() : null;
            connection = new TrustedConnection(opp, student, recruiter, note);
            connection = trustedConnectionRepository.save(connection);
        }

        CandidateMatchResponse matchDetail = matches.stream()
                .filter(m -> m.getCandidateAlias().equals(candidateAlias))
                .findFirst()
                .orElse(null);

        return mapToRecruiterResponse(connection, candidateAlias, matchDetail);
    }

    @Transactional
    public List<RecruiterConnectionResponse> getRecruiterConnections() {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        List<TrustedConnection> list = (recruiter.getRole() == Role.ADMIN)
                ? trustedConnectionRepository.findAll()
                : trustedConnectionRepository.findByRecruiterWithDetails(recruiter);

        return list.stream().map(conn -> {
            evaluateAndPersistExpiration(conn);
            String alias = candidateAliasService.getOrCreateAlias(conn.getStudent());
            
            // Look up match summary for context
            List<CandidateMatchResponse> matches = (conn.getOpportunity().getStatus() == OpportunityStatus.PUBLISHED)
                    ? matchingEngineService.findMatchesForOpportunity(conn.getOpportunity())
                    : Collections.emptyList();
            CandidateMatchResponse matchDetail = matches.stream()
                    .filter(m -> m.getCandidateAlias().equals(alias))
                    .findFirst()
                    .orElse(null);

            return mapToRecruiterResponse(conn, alias, matchDetail);
        }).collect(Collectors.toList());
    }

    @Transactional
    public RecruiterConnectionResponse getRecruiterConnectionById(Long id) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        TrustedConnection conn = trustedConnectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trusted connection not found"));

        if (recruiter.getRole() != Role.ADMIN && !conn.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to connection created by another recruiter");
        }

        evaluateAndPersistExpiration(conn);
        String alias = candidateAliasService.getOrCreateAlias(conn.getStudent());
        List<CandidateMatchResponse> matches = (conn.getOpportunity().getStatus() == OpportunityStatus.PUBLISHED)
                ? matchingEngineService.findMatchesForOpportunity(conn.getOpportunity())
                : Collections.emptyList();
        CandidateMatchResponse matchDetail = matches.stream()
                .filter(m -> m.getCandidateAlias().equals(alias))
                .findFirst()
                .orElse(null);

        return mapToRecruiterResponse(conn, alias, matchDetail);
    }

    @Transactional
    public List<StudentConnectionResponse> getStudentConnections() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        List<TrustedConnection> list = trustedConnectionRepository.findByStudentWithDetails(student);

        return list.stream().map(conn -> {
            evaluateAndPersistExpiration(conn);
            return mapToStudentResponse(conn);
        }).collect(Collectors.toList());
    }

    @Transactional
    public StudentConnectionResponse acceptConnection(Long id, ConnectionConsentRequest consent) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        TrustedConnection conn = trustedConnectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trusted connection not found"));

        if (!conn.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to connection request of another candidate");
        }

        evaluateAndPersistExpiration(conn);

        if (conn.getStatus() == ConnectionStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot accept an expired connection request");
        }

        if (conn.getStatus() != ConnectionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot accept connection request in status: " + conn.getStatus());
        }

        // Apply student's explicit, granular consent choices
        conn.setStatus(ConnectionStatus.ACCEPTED);
        conn.setRespondedAt(Instant.now());
        if (consent != null) {
            conn.setShareFullName(consent.isShareFullName());
            conn.setShareEmail(consent.isShareEmail());
            conn.setShareBio(consent.isShareBio());
            conn.setShareUniversity(consent.isShareUniversity());
            conn.setShareGraduationYear(consent.isShareGraduationYear());
            conn.setCustomMessage(consent.getCustomMessage() != null ? consent.getCustomMessage().trim() : null);
        }

        conn = trustedConnectionRepository.save(conn);
        return mapToStudentResponse(conn);
    }

    @Transactional
    public StudentConnectionResponse declineConnection(Long id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        TrustedConnection conn = trustedConnectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trusted connection not found"));

        if (!conn.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to connection request of another candidate");
        }

        evaluateAndPersistExpiration(conn);

        if (conn.getStatus() != ConnectionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot decline connection request in status: " + conn.getStatus());
        }

        // Declining never modifies student matching, evidence strength, or reputation
        conn.setStatus(ConnectionStatus.DECLINED);
        conn.setRespondedAt(Instant.now());
        conn = trustedConnectionRepository.save(conn);
        return mapToStudentResponse(conn);
    }

    @Transactional
    public void cancelConnection(Long id) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        TrustedConnection conn = trustedConnectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trusted connection not found"));

        boolean isStudentOwner = (currentUser.getRole() == Role.STUDENT && conn.getStudent().getUser().getId().equals(currentUser.getId()));
        boolean isRecruiterOwner = (currentUser.getRole() == Role.RECRUITER && conn.getRecruiter().getId().equals(currentUser.getId()));
        boolean isAdmin = (currentUser.getRole() == Role.ADMIN);

        if (!isStudentOwner && !isRecruiterOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to cancel this connection");
        }

        conn.setStatus(ConnectionStatus.CANCELLED);
        conn.setRespondedAt(Instant.now());
        trustedConnectionRepository.save(conn);
    }

    private void evaluateAndPersistExpiration(TrustedConnection conn) {
        if (conn.getStatus() == ConnectionStatus.PENDING && conn.isExpired()) {
            conn.setStatus(ConnectionStatus.EXPIRED);
            trustedConnectionRepository.save(conn);
        }
    }

    private RecruiterConnectionResponse mapToRecruiterResponse(TrustedConnection conn, String candidateAlias, CandidateMatchResponse matchDetail) {
        DisclosedStudentProfileDto disclosed = null;

        // Privacy Gate: Identity disclosure ONLY after ACCEPTED status
        if (conn.getStatus() == ConnectionStatus.ACCEPTED) {
            Student s = conn.getStudent();
            disclosed = new DisclosedStudentProfileDto(
                    conn.isShareFullName() ? s.getFullName() : null,
                    conn.isShareEmail() ? s.getUser().getEmail() : null,
                    conn.isShareBio() ? s.getBio() : null,
                    conn.isShareUniversity() ? s.getUniversity() : null,
                    conn.isShareGraduationYear() ? s.getGraduationYear() : null,
                    conn.getCustomMessage()
            );
        }

        return new RecruiterConnectionResponse(
                conn.getId(),
                conn.getOpportunity().getId(),
                conn.getOpportunity().getTitle(),
                candidateAlias,
                conn.getEffectiveStatus(),
                conn.getCreatedAt(),
                conn.getExpiresAt(),
                conn.getRespondedAt(),
                conn.getRecruiterNote(),
                disclosed,
                matchDetail != null ? matchDetail.getRequiredSkills() : Collections.emptyList(),
                matchDetail != null ? matchDetail.getPreferredSkills() : Collections.emptyList(),
                matchDetail != null ? matchDetail.getWhySurfaced() : null
        );
    }

    private StudentConnectionResponse mapToStudentResponse(TrustedConnection conn) {
        Opportunity opp = conn.getOpportunity();
        String orgName = (opp.getRecruiter().getOrganization() != null)
                ? opp.getRecruiter().getOrganization().getName()
                : "Independent Recruiter";

        List<SkillRequirementDto> req = new ArrayList<>();
        List<SkillRequirementDto> pref = new ArrayList<>();
        for (OpportunitySkill os : opp.getSkills()) {
            SkillRequirementDto dto = new SkillRequirementDto(
                    os.getSkill().getId(),
                    os.getSkill().getName(),
                    os.getSkill().getCategory(),
                    os.getSkillType()
            );
            if (os.getSkillType() == SkillRequirementType.REQUIRED) {
                req.add(dto);
            } else {
                pref.add(dto);
            }
        }

        return new StudentConnectionResponse(
                conn.getId(),
                opp.getId(),
                opp.getTitle(),
                opp.getType(),
                opp.getWorkType(),
                opp.getLocation(),
                orgName,
                conn.getRecruiterNote(),
                conn.getEffectiveStatus(),
                conn.getCreatedAt(),
                conn.getExpiresAt(),
                conn.getRespondedAt(),
                conn.isExpired(),
                conn.isShareFullName(),
                conn.isShareEmail(),
                conn.isShareBio(),
                conn.isShareUniversity(),
                conn.isShareGraduationYear(),
                conn.getCustomMessage(),
                req,
                pref
        );
    }
}
