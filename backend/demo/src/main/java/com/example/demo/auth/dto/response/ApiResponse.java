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
    
    public ApiResponse(String message, Boolean success) {
        this.message = message;
        this.success = success;
    }
    
    public static ApiResponse success(String message) {
        return new ApiResponse(message, true);
    }
    
    public static ApiResponse success(String message, Object data) {
        ApiResponse response = new ApiResponse(message, true);
        response.setData(data);
        return response;
    }
    
    public static ApiResponse error(String message) {
        return new ApiResponse(message, false);
    }
    
    private Object data;
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
}
