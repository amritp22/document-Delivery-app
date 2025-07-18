package com.delivery.citycourier.controller;

import com.delivery.citycourier.dto.LocationUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class LocationWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/location") // Client sends to /app/location
    public void sendLocation(LocationUpdate locationUpdate) {
        System.out.println("Received location update: " + locationUpdate);

        // Dynamically send to topic based on agentId
        String destination = "/topic/location/" + locationUpdate.getAgentId();
        messagingTemplate.convertAndSend(destination, locationUpdate);
    }
}
