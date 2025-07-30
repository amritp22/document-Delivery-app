package com.delivery.citycourier.dto;

import lombok.Data;

@Data
public class InstructionRequest {
	private String agentNo;
	private String userId;
    private String instruction;
}
