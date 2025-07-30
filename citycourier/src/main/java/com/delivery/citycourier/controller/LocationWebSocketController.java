package com.delivery.citycourier.controller;

import com.delivery.citycourier.conifg.AgentLocationCache;
import com.delivery.citycourier.dto.Coordinates;
import com.delivery.citycourier.dto.LocationUpdate;
import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.repository.DeliveryRequestRepository;
import com.delivery.citycourier.service.GenAiService;
import com.delivery.citycourier.service.NominatimService;
import com.delivery.citycourier.util.DistanceUtil;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class LocationWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private DeliveryRequestRepository objdeliveryRepo;
    
    @Autowired
    private NominatimService nominatimService;
    
    @Autowired
    private GenAiService genAiService;
    
    @Autowired
    private AgentLocationCache locationCache;

    @MessageMapping("/location") // Client sends to /app/location
    public void sendLocation(LocationUpdate locationUpdate) {
        System.out.println("Received location update: " + locationUpdate);
        
     // Update location in in-memory cache
        Coordinates coordinates = new Coordinates(locationUpdate.getLatitude(), locationUpdate.getLongitude());
        locationCache.updateLocation(locationUpdate.getAgentId(), coordinates);
        
        
        // 1. Get delivery info from DB
        DeliveryRequest delivery = objdeliveryRepo.findById(locationUpdate.getRequestId()).orElse(null);
        if (delivery == null) return;
        String destinationAddress = delivery.getDropLocation(); // stored as string in DB

        // 2. Get destination coordinates using Nominatim
        Coordinates dropCoords = nominatimService.getCoordinatesFromAddress(destinationAddress);
        if (dropCoords == null) return;

        // 3. Calculate distance
        double distance = DistanceUtil.calculateDistance(
            locationUpdate.getLatitude(), locationUpdate.getLongitude(),
            dropCoords.getLatitude(), dropCoords.getLongitude()
        );
        
        System.out.println("Agent is " + distance + " km from destination ");
        
        
        //4 Dynamically send to topic based on agentId
        String destination = "/topic/location/" + locationUpdate.getAgentId();
        messagingTemplate.convertAndSend(destination, locationUpdate);
        
     // 5. Notify user if < 1km
        if (distance < 1.0) {
            String userMessage = genAiService.rephraseArrivalMessage(delivery.getRequestedBy().getName());
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("agent", String.valueOf(locationUpdate.getAgentId()));
            userMsg.put("message", userMessage);
            messagingTemplate.convertAndSend("/topic/notify/" + delivery.getRequestedBy().getId(), userMsg);
        }
    }
}
