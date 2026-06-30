package com.itjobhub.ITJobHub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private String userId;
    private String email;
    private String fullName;
    private String role;
    private String accountStatus;
}
