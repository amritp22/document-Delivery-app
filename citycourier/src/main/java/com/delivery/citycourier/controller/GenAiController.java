package com.delivery.citycourier.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.delivery.citycourier.dto.GenAiIntent;
import com.delivery.citycourier.dto.GenAiRequest;
import com.delivery.citycourier.dto.GenAiResponse;
import com.delivery.citycourier.dto.InstructionRequest;
import com.delivery.citycourier.service.GenAiService;

@RestController
@RequestMapping("/api/genai")
public class GenAiController {

    @Autowired
    private GenAiService genAiService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/instruction")
    public ResponseEntity<String> processInstruction(@RequestBody InstructionRequest request) {
        String messageToAgent = genAiService.interpretDeliveryNote(request.getInstruction());

        // OPTIONAL: Push message to agent WebSocket here (if needed)
        // notificationService.notifyAgent(request.getUserId(), messageToAgent);
        messagingTemplate.convertAndSend("/topic/notifyAgent/" + request.getAgentNo(), messageToAgent);
        System.out.println("agent recved from frontedn "+request.getAgentNo());
        System.out.println("msg recvie from tinyllama "+messageToAgent);
        return ResponseEntity.ok(messageToAgent);
    }
    
    @PostMapping("/chat")
    public ResponseEntity<String> chatWithGenAi(@RequestParam("message") String message,@RequestParam("orderId") String orderId) {
        String response = genAiService.detectIntentAndRespond(message, orderId);
        return ResponseEntity.ok(response);
    }
}

