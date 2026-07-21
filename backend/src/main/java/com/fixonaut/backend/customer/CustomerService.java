package com.fixonaut.backend.customer;

import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthenticatedUserContext authenticatedUserContext;

    @Transactional
    public CustomerResponse create(CreateCustomerRequest request) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found"
                                )
                        );

        CustomerEntity customer = new CustomerEntity(
                organization,
                normalizeRequired(request.name()),
                normalizeRequired(request.phone()),
                normalizeNullable(request.email()),
                normalizeNullable(request.address()),
                normalizeNullable(request.city()),
                normalizeNullable(request.state()),
                normalizeNullable(request.postalCode()),
                normalizeNullable(request.notes())
        );

        CustomerEntity savedCustomer =
                customerRepository.save(customer);

        return toResponse(savedCustomer);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> search(
            String search,
            Pageable pageable
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        String normalizedSearch = normalizeNullable(search);

        return customerRepository
                .searchActiveCustomers(
                        organizationId,
                        normalizedSearch,
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(UUID customerId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        CustomerEntity customer =
                customerRepository
                        .findByIdAndOrganizationId(
                                customerId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"
                                )
                        );

        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(
            UUID customerId,
            UpdateCustomerRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        CustomerEntity customer =
                customerRepository
                        .findByIdAndOrganizationId(
                                customerId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"
                                )
                        );

        customer.updateContactDetails(
                normalizeRequired(request.name()),
                normalizeRequired(request.phone()),
                normalizeNullable(request.email()),
                normalizeNullable(request.address()),
                normalizeNullable(request.city()),
                normalizeNullable(request.state()),
                normalizeNullable(request.postalCode()),
                normalizeNullable(request.notes())
        );

        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse deactivate(UUID customerId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        CustomerEntity customer =
                customerRepository
                        .findByIdAndOrganizationId(
                                customerId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"
                                )
                        );

        customer.deactivate();

        return toResponse(customer);
    }

    private CustomerResponse toResponse(CustomerEntity customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getPostalCode(),
                customer.getNotes(),
                customer.isActive(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank() ? null : normalized;
    }
}