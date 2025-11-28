package com.snacksmart.controller;

import com.snacksmart.entity.Dish;
import com.snacksmart.entity.Restaurant;
import com.snacksmart.entity.User;
import com.snacksmart.repository.DishRepository;
import com.snacksmart.repository.RestaurantRepository;
import com.snacksmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowedHeaders = "*")
public class DishController {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Dish>> getAllDishes() {
        try {
            List<Dish> allDishes = dishRepository.findAll();
            // Filter to only show dishes from active restaurants with active owners
            List<Dish> activeDishes = allDishes.stream()
                .filter(dish -> {
                    if (dish.getRestaurantId() != null) {
                        var restaurant = restaurantRepository.findById(dish.getRestaurantId());
                        if (restaurant.isPresent()) {
                            // Check if restaurant is blocked
                            if (restaurant.get().getStatus() != null && 
                                restaurant.get().getStatus() == Restaurant.Status.BLOCKED) {
                                return false;
                            }
                            // Check if owner is blocked
                            if (restaurant.get().getOwnerId() != null) {
                                var owner = userRepository.findById(restaurant.get().getOwnerId());
                                if (owner.isPresent() && owner.get().getStatus() != null && 
                                    owner.get().getStatus() == User.Status.BLOCKED) {
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(activeDishes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Dish>> searchDishes(
            @RequestParam(required = false) String name) {
        try {
            List<Dish> dishes;
            if (name != null && !name.isEmpty()) {
                dishes = dishRepository.findByDishNameContainingIgnoreCase(name);
            } else {
                dishes = dishRepository.findAll();
            }
            return ResponseEntity.ok(dishes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Dish>> getDishesByRestaurant(@PathVariable Long restaurantId) {
        try {
            List<Dish> dishes = dishRepository.findByRestaurantId(restaurantId);
            return ResponseEntity.ok(dishes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/available")
    public ResponseEntity<List<Dish>> getAvailableDishes() {
    try {
        List<Dish> allDishes = dishRepository.findAll();
        // Filter only available dishes and from active restaurants with active owners
        List<Dish> availableDishes = allDishes.stream()
            .filter(d -> Boolean.TRUE.equals(d.getIsAvailable()))
            .filter(dish -> {
                if (dish.getRestaurantId() != null) {
                    var restaurant = restaurantRepository.findById(dish.getRestaurantId());
                    if (restaurant.isPresent()) {
                        // Check if restaurant or owner is blocked
                        if (restaurant.get().getStatus() == Restaurant.Status.BLOCKED) {
                            return false;
                        }
                        if (restaurant.get().getOwnerId() != null) {
                            var owner = userRepository.findById(restaurant.get().getOwnerId());
                            if (owner.isPresent() && owner.get().getStatus() == User.Status.BLOCKED) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(availableDishes);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
}


    @PostMapping("/add")
    public ResponseEntity<?> addDish(@RequestBody Map<String, Object> dishData) {
        try {
            System.out.println("Received dish data: " + dishData);
            
            Dish dish = new Dish();
            dish.setDishName((String) dishData.get("dishName"));
            dish.setPrice(Double.valueOf(dishData.get("price").toString()));
            dish.setVeg((Boolean) dishData.get("veg"));
            if (dishData.get("isAvailable") != null) {
            dish.setIsAvailable((Boolean) dishData.get("isAvailable"));
            }
            else {
            dish.setIsAvailable(true); // default
                }

            
            if (dishData.get("restaurantId") != null) {
                Long restaurantId = Long.valueOf(dishData.get("restaurantId").toString());
                Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
                if (restaurant != null) {
                    dish.setRestaurant(restaurant);
                } else {
                    return ResponseEntity.badRequest().body("Restaurant not found");
                }
            } else {
                return ResponseEntity.badRequest().body("Restaurant ID is required");
            }
            
            Dish savedDish = dishRepository.save(dish);
            return ResponseEntity.ok(savedDish);
        } catch (Exception e) {
            System.err.println("Error adding dish: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dish> updateDish(@PathVariable Long id, @RequestBody Map<String, Object> dishData) {
        try {
            Dish dish = dishRepository.findById(id).orElse(null);
            if (dish == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (dishData.get("dishName") != null) {
                dish.setDishName((String) dishData.get("dishName"));
            }
            if (dishData.get("price") != null) {
                dish.setPrice(Double.valueOf(dishData.get("price").toString()));
            }
            if (dishData.get("veg") != null) {
                dish.setVeg((Boolean) dishData.get("veg"));
            }
            if (dishData.get("isAvailable") != null) {
            dish.setIsAvailable((Boolean) dishData.get("isAvailable"));
            }

            
            Dish updatedDish = dishRepository.save(dish);
            return ResponseEntity.ok(updatedDish);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable Long id) {
        try {
            if (!dishRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            dishRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @PutMapping("/{id}/availability")
public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
    try {
        Dish dish = dishRepository.findById(id).orElse(null);
        if (dish == null) {
            return ResponseEntity.notFound().build();
        }

        Boolean isAvailable = request.get("isAvailable");
        if (isAvailable == null) {
            return ResponseEntity.badRequest().body("Missing 'isAvailable' value");
        }

        dish.setIsAvailable(isAvailable);
        dishRepository.save(dish);
        return ResponseEntity.ok("Availability updated successfully");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Error updating availability: " + e.getMessage());
    }
}

}