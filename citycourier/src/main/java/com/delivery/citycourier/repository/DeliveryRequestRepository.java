package com.delivery.citycourier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.model.DeliveryStatus;
import com.delivery.citycourier.model.User;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {

	List<DeliveryRequest> findByRequestedBy(User user);
	Optional<User> findByAssignedAgent(User agent);
	List<DeliveryRequest> findByStatus(DeliveryStatus deliveryStatus);
	List<DeliveryRequest> findByAssignedAgentId(Long agentId);
	List<DeliveryRequest> findByRequestedById(Long userId);


}
