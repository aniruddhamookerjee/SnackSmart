package com.snacksmart.controller;

import com.snacksmart.entity.User;
import com.snacksmart.entity.Restaurant;
import com.snacksmart.repository.UserRepository;
import com.snacksmart.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowedHeaders = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String username = loginData.get("username");
            String password = loginData.get("password");

            User user = userRepository.findByUsername(username);
            if (user != null && passwordEncoder.matches(password, user.getPassword())) {
                // Check if user is blocked
                if (user.getStatus() != null && user.getStatus() == User.Status.BLOCKED) {
                    return ResponseEntity.badRequest().body("Account has been blocked. Please contact administrator.");
                }
                
                return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole(),
                    "status", user.getStatus() != null ? user.getStatus().toString() : "ACTIVE",
                    "token", "dummy-jwt-token"
                ));
            }
            return ResponseEntity.badRequest().body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signupData) {
        try {
            String username = signupData.get("username");
            String email = signupData.get("email");
            
            // Check if username already exists
            if (userRepository.findByUsername(username) != null) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            
            // Check if email already exists
            if (userRepository.findByEmail(email) != null) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(signupData.get("password")));
            user.setRole(User.Role.valueOf(signupData.get("role")));

            userRepository.save(user);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed");
        }
    }
    
    @PostMapping("/register-owner")
    public ResponseEntity<?> registerOwner(@RequestBody Map<String, String> ownerData) {
        try {
            String username = ownerData.get("username");
            String email = ownerData.get("email");
            
            // Check if username already exists
            if (userRepository.findByUsername(username) != null) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            
            // Check if email already exists
            if (userRepository.findByEmail(email) != null) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            // Create owner user
            User owner = new User();
            owner.setUsername(username);
            owner.setEmail(email);
            owner.setPassword(passwordEncoder.encode(ownerData.get("password")));
            owner.setRole(User.Role.OWNER);
            
            User savedOwner = userRepository.save(owner);
            
            // Create restaurant
            Restaurant restaurant = new Restaurant();
            restaurant.setName(ownerData.get("restaurantName"));
            restaurant.setAddress(ownerData.get("address"));
            restaurant.setPhone(ownerData.get("phone"));
            restaurant.setDescription(ownerData.get("description"));
            restaurant.setOwnerId(savedOwner.getId());
            
            restaurantRepository.save(restaurant);
            
            return ResponseEntity.ok("Owner and restaurant registered successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginData) {
        try {
            String username = loginData.get("username");
            String password = loginData.get("password");
            
            if ("admin".equals(username) && "123456".equals(password)) {
                return ResponseEntity.ok(Map.of(
                    "message", "Admin login successful",
                    "username", "admin",
                    "role", "ADMIN",
                    "token", "admin-jwt-token"
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admin login failed"));
        }
    }
}