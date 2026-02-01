package com.smart.hostel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;

@Configuration
public class RazorpayConfig {

	private final String keyId;
	private final String keySecret;

	public RazorpayConfig(@Value("${razorpay.key.id}") String keyId,
			@Value("${razorpay.key.secret}") String keySecret) {
		this.keyId = keyId;
		this.keySecret = keySecret;
	}

	@Bean
	public RazorpayClient razorpayClient() throws Exception {
		return new RazorpayClient(keyId, keySecret);
	}
}
