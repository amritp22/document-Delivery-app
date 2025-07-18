package com.delivery.citycourier.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.model.DeliveryStatus;
import com.delivery.citycourier.model.User;
import com.delivery.citycourier.repository.DeliveryRequestRepository;
import com.delivery.citycourier.repository.UserRepository;
import com.delivery.citycourier.service.DeliveryRequestService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DeliveryRequestServiceImpl implements DeliveryRequestService{

	private DeliveryRequestRepository deliveryRequestRepository;
	private UserRepository userRepository;
    private SimpMessagingTemplate messagingTemplate; // Used to send WebSocket messages

	
	@Override
	public DeliveryRequest createDeliveryRequest(Long UserId, DeliveryRequest deliveryRequest) {
		User user=userRepository.findById(UserId)
				.orElseThrow(()->new RuntimeException("User Not Found"));
		deliveryRequest.setRequestedBy(user);
		deliveryRequest.setStatus(DeliveryStatus.PENDING);
		deliveryRequest.setRequestedAt(LocalDateTime.now());
		// 🟡 Notify all agents about the new delivery request
        String message = "📦 New delivery request from User: " + user.getName();
        messagingTemplate.convertAndSend("/topic/notifications/agents", message);
		//dumy
		return deliveryRequestRepository.save(deliveryRequest);
		
	}

	@Override
	public List<DeliveryRequest> getAllRequests() {
		
		return deliveryRequestRepository.findAll();
	}

	@Override
	public List<DeliveryRequest> getRequestsByUser(Long userId) {
//		User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
        return deliveryRequestRepository.findByRequestedById(userId);
	}

	@Override
	public DeliveryRequest assignAgent(Long requestId, Long agentId) {
		DeliveryRequest deliveryRequest=deliveryRequestRepository.findById(requestId)
				.orElseThrow(()->new RuntimeException("reuqest not found"));
		
		User user = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
		
		if(deliveryRequest.getStatus()!=DeliveryStatus.PENDING) {
			throw new RuntimeException("Already assigned");
		}
		deliveryRequest.setAssignedAgent(user);
		deliveryRequest.setStatus(DeliveryStatus.ASSIGNED);
		// ✅ Notify the user who created the delivery request
		Long userId = deliveryRequest.getRequestedBy().getId();
        String message = "✅ Your delivery request has been accepted by an agent! "+user.getName();
        messagingTemplate.convertAndSend("/topic/notifications/user/" + userId, message);
		return deliveryRequestRepository.save(deliveryRequest);
	}

	@Override
	public DeliveryRequest updateStatus(Long requestId, DeliveryStatus newStatus) {
		DeliveryRequest deliveryRequest=deliveryRequestRepository.findById(requestId)
				.orElseThrow(() -> new RuntimeException("Delivery not found"));
		
		deliveryRequest.setStatus(newStatus);
		Long userId = deliveryRequest.getRequestedBy().getId();
        String message = "✅ Your delivery status is updated to "+newStatus;
        messagingTemplate.convertAndSend("/topic/notifications/user/" + userId, message);
		return deliveryRequestRepository.save(deliveryRequest);
	}

	@Override
	public List<DeliveryRequest> getPendingRequests() {
		return deliveryRequestRepository.findByStatus(DeliveryStatus.PENDING);
	}

	@Override
	public List<DeliveryRequest> findByAssignedAgentId(Long agentId) {
		return deliveryRequestRepository.findByAssignedAgentId(agentId);
	}
	
}
