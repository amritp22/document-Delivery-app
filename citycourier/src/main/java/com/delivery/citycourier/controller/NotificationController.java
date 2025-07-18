package com.delivery.citycourier.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to handle WebSocket messaging for agent notifications.
 */
@RestController
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Used to send messages to WebSocket subscribers

    /**
     * This endpoint is called when a user places a new delivery request.
     * MessageMapping means it listens to "/app/notify-agents" from the client.
     *
     * @param message - The notification message to be sent
     */
    @MessageMapping("/notify-agents")
    public void notifyAgents(String message) {
        // Send the message to all subscribers of "/topic/notifications/agents"
        messagingTemplate.convertAndSend("/topic/notifications/agents", message);
    }
}
