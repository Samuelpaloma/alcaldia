package com.example.demo.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    private String message;
    private Boolean success = true;
    
    public ApiResponse(String message) {
        this.message = message;
        this.success = true;
    }
}