package com.delivery.citycourier.service;
import java.util.*;
import org.springframework.http.MediaType;


import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.delivery.citycourier.conifg.AgentLocationCache;
import com.delivery.citycourier.dto.Coordinates;
import com.delivery.citycourier.model.DeliveryRequest;
import com.delivery.citycourier.repository.DeliveryRequestRepository;
import com.delivery.citycourier.util.DistanceUtil;

import jakarta.validation.constraints.AssertFalse.List;

import org.springframework.http.HttpHeaders;
//@Service
//public class GenAiService {
//    public String generateArrivalPrompt(String customerName) {
//        // Static for now; you can replace with OpenAI API call later
//        return "Hi " + customerName + ", your delivery agent is arriving shortly. Please be ready!";
//    }
//}

@Service
public class GenAiService {

	@Autowired
	private DeliveryRequestRepository objdeliveryRepo;
	
	@Autowired
    private AgentLocationCache agentLocationCache;
	
	@Autowired
    private NominatimService nominatimService;
	
    private final RestTemplate restTemplate = new RestTemplate();

    public String rephraseArrivalMessage(String customerName) {
        String prompt = "Rephrase the following message in 10 words and to the point in polite English only: hi \"" + customerName + "\", your delivery agent is arriving shortly. if not available update instruction";

        return callTinyLlama(prompt);
    }

    public String interpretDeliveryNote(String userInput) {
        String prompt = "User left a last-minute delivery instruction: \"" + userInput +
            "\". Rewrite it as a **VERY SHORT** instruction for a delivery agent. " +
            "⚠️ Must be UNDER 10 WORDS. ❌ No greeting, no extra explanation. " +
            "✅ Only short location-based instruction. For example: 'Leave at main gate' or 'Ring bell at back door'.";

        return callTinyLlama(prompt);
    }


    public String detectIntentAndRespond(String userInput, String orderId) {
    	System.out.println("order id "+orderId);
    	System.out.println("userInput id "+userInput);
    	String prompt = "You are an intent classifier. Based on the user's query, respond with only one intent keyword from the list below. "
    		    + "Do not return any explanation, reasoning, or additional text. Respond with exactly one word from the list.\n"
    		    + "Possible intents: track_agent, delivery_time, greet, unknown.\n"
    		    + "User query: \"" + userInput + "\"\n"
    		    + "Intent:";


        String rawIntent = callTinyLlama(prompt).trim().toLowerCase();
        System.out.println("raw ai intent "+rawIntent);
     // Define allowed intents
        java.util.List<String> allowedIntents = Arrays.asList("track_agent", "update_instruction", "cancel_order", "delivery_time", "greet", "unknown");

        String intent = allowedIntents.stream()
                .filter(rawIntent::contains)
                .findFirst()
                .orElse("unknown");

        System.out.println("Final extracted intent: " + intent);
        switch (intent) {
            case "track_agent":
                return fetchAgentLocation(orderId);
            case "delivery_time":
                return estimateDeliveryTime(orderId); // you can implement this
            case "update_instruction":
                return "Sure, please provide the new delivery instruction.";
            case "cancel_order":
                return "Your cancellation request has been received. Please wait.";
            case "greet":
                return "Hi! How can I help you with your delivery?";
            default:
                return "Sorry, I couldn't understand your request.";
        }
    }
    	
    private String fetchAgentLocation(String orderId) {
        // 1. Fetch delivery details
        DeliveryRequest delivery = objdeliveryRepo.findById(Long.parseLong(orderId)).orElse(null);
        if (delivery == null || delivery.getAssignedAgent() == null) {
            return "Sorry, I couldn't find delivery details for your request.";
        }

        Long agentId = delivery.getAssignedAgent().getId();

        // 2. Get agent's last known coordinates
        Coordinates coords = agentLocationCache.getLatestLocation(agentId);
        if (coords == null) {
            return "Sorry, I couldn't fetch the agent's current location.";
        }

        // 3. Convert coordinates to address
        String address = nominatimService.getAddressFromCoordinates(coords.getLatitude(), coords.getLongitude());
        if (address == null || address.isEmpty()) {
            return "The agent is currently en route, but their exact address couldn't be determined.";
        }

        // 4. Respond with human-readable message
        return "Your delivery agent is currently near: " + address;
    }

    public String estimateDeliveryTime(String orderId) {
        DeliveryRequest delivery = objdeliveryRepo.findById(Long.parseLong(orderId)).orElse(null);
        if (delivery == null || delivery.getAssignedAgent() == null) {
            return "Delivery details not found.";
        }

        Long agentId = delivery.getAssignedAgent().getId();
        Coordinates agentCoords = agentLocationCache.getLatestLocation(agentId);
        if (agentCoords == null) {
            return "Agent location not currently available.";
        }

        Coordinates dropCoords = nominatimService.getCoordinatesFromAddress(delivery.getDropLocation());
        if (dropCoords == null) {
            return "Could not geocode the drop location.";
        }

        double distanceKm = DistanceUtil.calculateDistance(
            agentCoords.getLatitude(),
            agentCoords.getLongitude(),
            dropCoords.getLatitude(),
            dropCoords.getLongitude()
        );

        // Assume average speed in km/h, convert to minutes:
        double estimatedMinutes = (distanceKm / 25.0) * 60;
        int minutes = (int) Math.ceil(estimatedMinutes);

        return "Estimated delivery time: ~" + minutes + " minutes (" +
            String.format("%.2f km", distanceKm) + " away).";
    }
/*    	private String estimateDeliveryTime(String orderId) {
    	    // 1. Fetch delivery info
    	    DeliveryRequest delivery = objdeliveryRepo.findById(Long.parseLong(orderId)).orElse(null);
    	    if (delivery == null || delivery.getAssignedAgent() == null) {
    	        return "Sorry, we couldn't estimate the delivery time.";
    	    }

    	    Long agentId = delivery.getAssignedAgent().getId();
    	    String destinationAddress = delivery.getDropLocation();

    	    // 2. Get current location of agent
    	    Coordinates coords = agentLocationCache.getLatestLocation(agentId);
    	    if (coords == null) {
    	        return "Live location not available to estimate time.";
    	    }

    	    // 3. Convert lat/long to address (optional: makes TinyLlama input more natural)
    	    String currentAddress = nominatimService.getAddressFromCoordinates(coords.getLatitude(), coords.getLongitude());
    	    if (currentAddress == null || currentAddress.isEmpty()) {
    	        currentAddress = "latitude " + coords.getLatitude() + " and longitude " + coords.getLongitude();
    	    }

    	    // 4. Create TinyLlama prompt
    	    String prompt = "Estimate how much time it might take to deliver a package "
    	            + "from \"" + currentAddress + "\" to \"" + destinationAddress + "\" by road. "
    	            + "Respond in a short friendly message like: 'Estimated delivery time is X minutes.' "
    	            + "Assume average traffic and delivery speed.";

    	    // 5. Call model
    	    return callTinyLlama(prompt);
    	}
*/
    private String callTinyLlama(String prompt) {
        String url = "http://localhost:11434/api/generate"; // Ollama or LM Studio endpoint

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        JSONObject request = new JSONObject();
        request.put("model", "tinyllama");
        request.put("prompt", prompt);
        request.put("stream", false);  // get entire response, not in chunks

        HttpEntity<String> entity = new HttpEntity<>(request.toString(), headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            JSONObject json = new JSONObject(response.getBody());
            return json.getString("response"); // returns the model's output
        } else {
            return "Sorry, couldn't process the message.";
        }
    }
}
