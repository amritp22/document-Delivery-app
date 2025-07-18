package com.delivery.citycourier.dto;

import lombok.Data;

@Data
public class AuthRequest {
	private String email;
    private String password;
}
