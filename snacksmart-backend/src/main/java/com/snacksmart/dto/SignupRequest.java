package com.snacksmart.dto;

import com.snacksmart.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SignupRequest {
    @NotBlank
    private String username;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String password;
    
    private User.Role role;
    
    private String restaurantName;
    
    private String restaurantLocation;

    // Constructors
    public SignupRequest() {}

    public SignupRequest(String username, String email, String password, User.Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getRestaurantLocation() { return restaurantLocation; }
    public void setRestaurantLocation(String restaurantLocation) { this.restaurantLocation = restaurantLocation; }
}