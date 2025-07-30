package com.delivery.citycourier.dto;

import lombok.Data;
import lombok.Getter;

@Getter
public class GenAiResponse {

	private String reply;
	public GenAiResponse(String reply) {
        this.reply = reply;
    }
}
