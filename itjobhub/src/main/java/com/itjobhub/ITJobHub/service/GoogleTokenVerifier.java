package com.itjobhub.ITJobHub.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.itjobhub.ITJobHub.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Xác thực ID Token do Google trả về cho Frontend (Google Identity Services
 * "Sign in with Google" - One Tap / button). Backend chỉ cần verify token,
 * KHÔNG cần client secret vì đây là luồng "implicit"/ID token, phù hợp với
 * kiến trúc Monolithic SPA (React) + Spring Boot REST API.
 */
@Service
public class GoogleTokenVerifier {

    @Value("${app.google.client-id}")
    private String googleClientId;

    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new AppException("Google ID Token không hợp lệ.", HttpStatus.UNAUTHORIZED);
            }
            return idToken.getPayload();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Xác thực Google thất bại: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}
