package com.kasumio.evidence;

import com.kasumio.common.SecurityUtils;
import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.evidence.dto.EvidenceResponse;
import com.kasumio.evidence.dto.VerificationResponse;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final SkillRepository skillRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final com.kasumio.action.OutcomeIntelligenceService outcomeIntelligenceService;

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            SkillRepository skillRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            com.kasumio.action.OutcomeIntelligenceService outcomeIntelligenceService) {
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.skillRepository = skillRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.outcomeIntelligenceService = outcomeIntelligenceService;
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getMyEvidence() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        List<Evidence> evidenceList = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);

        return evidenceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EvidenceResponse createEvidence(EvidenceRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected skill does not exist"));

        Evidence evidence = new Evidence(
                student,
                skill,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getEvidenceUrl().trim(),
                request.getEvidenceType()
        );

        evidence = evidenceRepository.save(evidence);
        outcomeIntelligenceService.recordEvidenceCreated(student, evidence);
        return mapToResponse(evidence);
    }

    @Transactional(readOnly = true)
    public EvidenceResponse getEvidenceById(Long id) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);

        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found"));

        if (currentUser.getRole() == Role.STUDENT && !evidence.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to evidence belonging to another student");
        }

        return mapToResponse(evidence);
    }

    @Transactional
    public EvidenceResponse updateEvidence(Long id, EvidenceRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        Evidence evidence = evidenceRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found or access denied"));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected skill does not exist"));

        evidence.setTitle(request.getTitle().trim());
        evidence.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        evidence.setEvidenceUrl(request.getEvidenceUrl().trim());
        evidence.setEvidenceType(request.getEvidenceType());
        evidence.setSkill(skill);

        evidence = evidenceRepository.save(evidence);
        outcomeIntelligenceService.recordEvidenceCreated(student, evidence);
        return mapToResponse(evidence);
    }

    @Transactional
    public void deleteEvidence(Long id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        Evidence evidence = evidenceRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found or access denied"));

        String skillName = evidence.getSkill().getName();
        outcomeIntelligenceService.recordEvidenceDeleted(student, skillName, id);
        evidenceRepository.delete(evidence);
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getPendingVerificationEvidence() {
        return evidenceRepository.findUnverifiedEvidence()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EvidenceResponse mapToResponse(Evidence evidence) {
        Optional<Verification> verificationOpt = verificationRepository.findByEvidenceId(evidence.getId());
        boolean isVerified = verificationOpt.isPresent();

        VerificationResponse verificationResponse = null;
        if (isVerified) {
            Verification v = verificationOpt.get();
            verificationResponse = new VerificationResponse(
                    v.getId(),
                    v.getOrganization().getId(),
                    v.getOrganization().getName(),
                    v.getVerifiedByUser().getId(),
                    v.getVerifiedByUser().getEmail(),
                    v.getVerifiedAt()
            );
        }

        return new EvidenceResponse(
                evidence.getId(),
                evidence.getStudent().getId(),
                evidence.getStudent().getFullName(),
                evidence.getSkill().getId(),
                evidence.getSkill().getName(),
                evidence.getSkill().getCategory(),
                evidence.getTitle(),
                evidence.getDescription(),
                evidence.getEvidenceUrl(),
                evidence.getEvidenceType(),
                evidence.getCreatedAt(),
                isVerified,
                verificationResponse
        );
    }
}
