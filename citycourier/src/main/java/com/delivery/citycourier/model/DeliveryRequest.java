package com.delivery.citycourier.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name="delivery_requests")
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryRequest {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
    private String pickupLocation;
    private String dropLocation;
    private String itemDescription;
    private Double distanceInKm;
    private Double cost;
    private String weight;
    private String senderPhone;
	private String receiverPhone;
    
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;
    
    private LocalDateTime requestedAt;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User requestedBy;
    
    @ManyToOne
    @JoinColumn(name="assigned_agent_id")
    private User assignedAgent;
}
