package com.kasumio.organization;

import com.kasumio.organization.dto.CreateOrganizationRequest;
import com.kasumio.organization.dto.OrganizationDto;
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

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationDto> getAllOrganizations() {
        return organizationRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
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
                request.getWebsite() != null ? request.getWebsite().trim() : null
        );
        org = organizationRepository.save(org);
        return mapToDto(org);
    }

    private OrganizationDto mapToDto(Organization org) {
        return new OrganizationDto(org.getId(), org.getName(), org.getType(), org.getWebsite());
    }
}
