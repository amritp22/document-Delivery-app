package com.delivery.citycourier.dto;

import lombok.Data;

@Data
public class LocationUpdate {
    private Long requestId;
    private Long agentId;
    private double latitude;
    private double longitude;
}
