package com.smart.hostel.service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.smart.hostel.exception.QRCodeGenerationException;
import com.smart.hostel.security.JwtUtil;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class QRCodeService {

	private final JwtUtil jwtUtil;

	public String generateAttendanceQr(String username) {
		try {
			String token = jwtUtil.generateQrToken(username);

			QRCodeWriter qrCodeWriter = new QRCodeWriter();
			Map<EncodeHintType, Object> hints = new HashMap<>();
			hints.put(EncodeHintType.MARGIN, 1);
			hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);

			BitMatrix bitMatrix = qrCodeWriter.encode(token, BarcodeFormat.QR_CODE, 500, 500, hints);

			ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
			MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
			byte[] pngData = pngOutputStream.toByteArray();

			return Base64.getEncoder().encodeToString(pngData);

		} catch (Exception e) {
			throw new QRCodeGenerationException("Error generating QR code", e);
		}
	}

	public boolean validateQrToken(String token) {
		return jwtUtil.validateQrToken(token);
	}

	public String getUsernameFromQrToken(String token) {
		return jwtUtil.getUsernameFromToken(token);
	}
}
