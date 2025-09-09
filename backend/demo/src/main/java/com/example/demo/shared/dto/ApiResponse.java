package com.example.demo.shared.dto;

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
    
    public static ApiResponse success(String message) {
        return new ApiResponse(message, true);
    }
    
    public static ApiResponse error(String message) {
        return new ApiResponse(message, false);
    }
}