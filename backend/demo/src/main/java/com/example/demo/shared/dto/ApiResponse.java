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
    private Object data;
    
    public ApiResponse(String message) {
        this.message = message;
        this.success = true;
    }
    
    public ApiResponse(String message, Object data) {
        this.message = message;
        this.success = true;
        this.data = data;
    }
    
    public static ApiResponse success(String message) {
        return new ApiResponse(message, true);
    }
    
    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(message, data);
    }
    
    public static ApiResponse error(String message) {
        return new ApiResponse(message, false);
    }
}