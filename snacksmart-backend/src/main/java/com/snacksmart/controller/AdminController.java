package com.snacksmart.controller;

import com.snacksmart.repository.UserRepository;
import com.snacksmart.repository.RestaurantRepository;
import com.snacksmart.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowedHeaders = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private DishRepository dishRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalUsers = userRepository.count();
            long totalRestaurants = restaurantRepository.count();
            long totalDishes = dishRepository.count();
            long totalCustomers = userRepository.countByRole(com.snacksmart.entity.User.Role.CUSTOMER);
            long totalOwners = userRepository.countByRole(com.snacksmart.entity.User.Role.OWNER);
            long totalAdmins = userRepository.countByRole(com.snacksmart.entity.User.Role.ADMIN);
            long activeUsers = userRepository.countByStatus(com.snacksmart.entity.User.Status.ACTIVE);
            long blockedUsers = userRepository.countByStatus(com.snacksmart.entity.User.Status.BLOCKED);
            long activeRestaurants = restaurantRepository.countByStatus(com.snacksmart.entity.Restaurant.Status.ACTIVE);
            long blockedRestaurants = restaurantRepository.countByStatus(com.snacksmart.entity.Restaurant.Status.BLOCKED);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalRestaurants", totalRestaurants);
            stats.put("totalDishes", totalDishes);
            stats.put("totalCustomers", totalCustomers);
            stats.put("totalOwners", totalOwners);
            stats.put("totalAdmins", totalAdmins);
            stats.put("activeUsers", activeUsers);
            stats.put("blockedUsers", blockedUsers);
            stats.put("activeRestaurants", activeRestaurants);
            stats.put("blockedRestaurants", blockedRestaurants);
            stats.put("ordersToday", Math.floor(Math.random() * 200) + 50);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/user/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            var user = userRepository.findById(id);
            if (!user.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            var userEntity = user.get();
            userEntity.setStatus(com.snacksmart.entity.User.Status.valueOf(statusData.get("status")));
            userRepository.save(userEntity);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/restaurant/{id}/status")
    public ResponseEntity<?> updateRestaurantStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            var restaurant = restaurantRepository.findById(id);
            if (!restaurant.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            var restaurantEntity = restaurant.get();
            restaurantEntity.setStatus(com.snacksmart.entity.Restaurant.Status.valueOf(statusData.get("status")));
            restaurantRepository.save(restaurantEntity);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}