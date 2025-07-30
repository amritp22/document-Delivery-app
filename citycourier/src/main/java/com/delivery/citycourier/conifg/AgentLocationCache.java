package com.delivery.citycourier.conifg;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.delivery.citycourier.dto.Coordinates;

@Component
public class AgentLocationCache {
    private final Map<Long, Coordinates> locationMap = new ConcurrentHashMap<>();

    public void updateLocation(Long agentId, Coordinates coordinates) {
        locationMap.put(agentId, coordinates);
    }

    public Coordinates getLatestLocation(Long agentId) {
        return locationMap.get(agentId);
    }
}

