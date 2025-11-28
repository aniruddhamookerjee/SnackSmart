package com.snacksmart.controller;

import com.snacksmart.entity.Restaurant;
import com.snacksmart.entity.User;
import com.snacksmart.repository.RestaurantRepository;
import com.snacksmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowedHeaders = "*")
public class RestaurantController {

    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        try {
            List<Restaurant> allRestaurants = restaurantRepository.findAll();
            // Filter to only show active restaurants with active owners
            List<Restaurant> activeRestaurants = allRestaurants.stream()
                .filter(restaurant -> {
                    // Check if restaurant is active
                    if (restaurant.getStatus() != null && restaurant.getStatus() == Restaurant.Status.BLOCKED) {
                        return false;
                    }
                    // Check if owner is active
                    if (restaurant.getOwnerId() != null) {
                        var owner = userRepository.findById(restaurant.getOwnerId());
                        if (owner.isPresent() && owner.get().getStatus() != null && 
                            owner.get().getStatus() == User.Status.BLOCKED) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(activeRestaurants);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        try {
            Optional<Restaurant> restaurant = restaurantRepository.findById(id);
            if (restaurant.isPresent()) {
                return ResponseEntity.ok(restaurant.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Restaurant> addRestaurant(@RequestBody Restaurant restaurant) {
        try {
            if (restaurant.getName() == null || restaurant.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);
            return ResponseEntity.ok(savedRestaurant);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        try {
            Optional<Restaurant> optionalRestaurant = restaurantRepository.findById(id);
            if (!optionalRestaurant.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Restaurant restaurant = optionalRestaurant.get();
            
            if (restaurantDetails.getName() != null) {
                restaurant.setName(restaurantDetails.getName());
            }
            if (restaurantDetails.getAddress() != null) {
                restaurant.setAddress(restaurantDetails.getAddress());
            }
            if (restaurantDetails.getPhone() != null) {
                restaurant.setPhone(restaurantDetails.getPhone());
            }
            if (restaurantDetails.getRating() != null) {
                restaurant.setRating(restaurantDetails.getRating());
            }
            if (restaurantDetails.getVeg() != null) {
                restaurant.setVeg(restaurantDetails.getVeg());
            }
            if (restaurantDetails.getNonVeg() != null) {
                restaurant.setNonVeg(restaurantDetails.getNonVeg());
            }
            if (restaurantDetails.getDescription() != null) {
                restaurant.setDescription(restaurantDetails.getDescription());
            }
            if (restaurantDetails.getMenu() != null) {
                restaurant.setMenu(restaurantDetails.getMenu());
            }

            Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
            return ResponseEntity.ok(updatedRestaurant);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        try {
            if (!restaurantRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            restaurantRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getRestaurantStats(@PathVariable Long id) {
        try {
            Optional<Restaurant> restaurant = restaurantRepository.findById(id);
            if (!restaurant.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get basic stats (you can expand this with real data)
            Map<String, Object> stats = Map.of(
                "totalDishes", restaurant.get().getMenu().size(),
                "ordersToday", Math.floor(Math.random() * 50) + 10,
                "averageRating", restaurant.get().getRating() != null ? restaurant.get().getRating() : 4.2,
                "revenue", Math.floor(Math.random() * 10000) + 5000
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}