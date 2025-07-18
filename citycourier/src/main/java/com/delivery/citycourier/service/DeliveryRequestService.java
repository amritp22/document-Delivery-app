package com.delivery.citycourier.service;

import java.util.List;

import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.model.DeliveryStatus;

public interface DeliveryRequestService {

	public DeliveryRequest createDeliveryRequest(Long UserId,DeliveryRequest deliveryRequest);
	public List<DeliveryRequest> getAllRequests();
	public DeliveryRequest assignAgent(Long requestId, Long agentId);
	public DeliveryRequest updateStatus(Long requestId, DeliveryStatus newStatus);
	public List<DeliveryRequest> getPendingRequests();
	public List<DeliveryRequest> findByAssignedAgentId(Long agentId);
	public List<DeliveryRequest> getRequestsByUser(Long userId);

}
