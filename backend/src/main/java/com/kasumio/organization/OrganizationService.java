package com.kasumio.organization;

import com.kasumio.organization.dto.CreateOrganizationRequest;
import com.kasumio.organization.dto.OrganizationDto;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import com.kasumio.user.UserStatus;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationService(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationDto> getAllOrganizations() {
        return organizationRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizationDto> getPendingOrganizations() {
        return organizationRepository.findByApprovalStatus(OrganizationApprovalStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationDto getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        return mapToDto(org);
    }

    @Transactional
    public OrganizationDto createOrganization(CreateOrganizationRequest request) {
        Organization org = new Organization(
                request.getName().trim(),
                request.getType(),
                request.getWebsite() != null ? request.getWebsite().trim() : null,
                OrganizationApprovalStatus.APPROVED
        );
        org = organizationRepository.save(org);
        return mapToDto(org);
    }

    @Transactional
    public OrganizationDto approveOrganization(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        org.setApprovalStatus(OrganizationApprovalStatus.APPROVED);
        org = organizationRepository.save(org);

        // Activate any pending recruiters under this organization
        List<User> associatedUsers = userRepository.findByOrganization(org);
        for (User u : associatedUsers) {
            if (u.getStatus() == UserStatus.PENDING) {
                u.setStatus(UserStatus.ACTIVE);
                userRepository.save(u);
            }
        }

        return mapToDto(org);
    }

    private OrganizationDto mapToDto(Organization org) {
        return new OrganizationDto(
                org.getId(),
                org.getName(),
                org.getType(),
                org.getWebsite(),
                org.getApprovalStatus() != null ? org.getApprovalStatus().name() : OrganizationApprovalStatus.APPROVED.name()
        );
    }
}
