package com.delivery.citycourier.conifg;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig enables STOMP-based WebSocket messaging.
 * It allows real-time communication for features like live tracking and agent notifications.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
	@Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enables a simple memory-based message broker for broadcasting messages to /topic
		 /**
         * Enables an in-memory message broker that listens to destinations prefixed with "/topic".
         * All messages sent to "/topic/xyz" will be broadcast to subscribers.
         */
        config.enableSimpleBroker("/topic");
        /**
         * Prefix for messages sent from the frontend client to server handlers.
         * Client will use "/app/xyz" to send messages.
         */
        config.setApplicationDestinationPrefixes("/app"); // Prefix for messages coming from client
        //to server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registering the WebSocket endpoint that the client will use to connect
    	 /**
         * Registers a single WebSocket endpoint that clients use to establish connection.
         * SockJS is enabled for fallback support in browsers that don’t support WebSocket.
         */
        registry.addEndpoint("/ws-location").setAllowedOriginPatterns("*").withSockJS();
    }
}	
