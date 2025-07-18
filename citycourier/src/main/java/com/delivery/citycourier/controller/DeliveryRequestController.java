package com.delivery.citycourier.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.model.DeliveryStatus;
import com.delivery.citycourier.service.DeliveryRequestService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/deliveries")
@AllArgsConstructor
public class DeliveryRequestController {

	private DeliveryRequestService deliveryService;
	
	@PostMapping("/create/{UserId}")
	public ResponseEntity<DeliveryRequest> create(@PathVariable("UserId") Long userId,@RequestBody DeliveryRequest request){
		DeliveryRequest createdRequest=deliveryService.createDeliveryRequest(userId, request);
		return new ResponseEntity<>(createdRequest,HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<List<DeliveryRequest>> getAll(){
		return new ResponseEntity<>(deliveryService.getAllRequests(),HttpStatus.OK);
	}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DeliveryRequest>> getByUser(@PathVariable Long userId) {
        List<DeliveryRequest> userRequests = deliveryService.getRequestsByUser(userId);
        return new ResponseEntity<>(userRequests, HttpStatus.OK);
    }
    @PutMapping("/assign/{requestId}/agent/{agentId}")
    public ResponseEntity<DeliveryRequest> assignAgent(@PathVariable("requestId") Long requestId,
    		@PathVariable("agentId") Long agentId){
    	DeliveryRequest assingedRequest=deliveryService.assignAgent(requestId, agentId);
    	if(assingedRequest!=null) {
    		return new ResponseEntity<>(assingedRequest,HttpStatus.OK);
    	}else {
    		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    	}
    }
    @PutMapping("/{requestId}/status")
    public ResponseEntity<DeliveryRequest> updateStatus(@PathVariable("requestId") Long requestId,
                                                        @RequestParam("status") DeliveryStatus status) {
        DeliveryRequest updatedRequest = deliveryService.updateStatus(requestId, status);
        if (updatedRequest != null) {
            return new ResponseEntity<>(updatedRequest, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Or another appropriate status
        }
    }
    @GetMapping("/pending")
    public ResponseEntity<List<DeliveryRequest>> getPendingRequests() {
        List<DeliveryRequest> pendingRequests = deliveryService.getPendingRequests();
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }
    @GetMapping("/assigned/{agentId}")
    public ResponseEntity<List<DeliveryRequest>> getAssignedDeliveries(@PathVariable("agentId") Long agentId) {
        List<DeliveryRequest> assignedRequests = deliveryService.findByAssignedAgentId(agentId);
        return ResponseEntity.ok(assignedRequests);
    }

    @GetMapping("/user/{userId}/requests")
    public ResponseEntity<List<DeliveryRequest>> getRequestsByUser(@PathVariable("userId") Long userId) {
        List<DeliveryRequest> requests = deliveryService.getRequestsByUser(userId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    

}
