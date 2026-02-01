package com.smart.hostel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

	private final JavaMailSender mailSender;
	private final String fromEmail;

	public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromEmail) {
		this.mailSender = mailSender;
		this.fromEmail = fromEmail;
	}

	public void sendEmail(String to, String subject, String body) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(fromEmail);
			message.setTo(to);
			message.setSubject(subject);
			message.setText(body);
			mailSender.send(message);
			log.info("Email sent successfully to {}", to);
		} catch (Exception e) {
			log.error("Failed to send email to {}: {}", to, e.getMessage());
			log.debug("DEBUG MODE - Email Body:\n{}", body);
		}
	}
}
