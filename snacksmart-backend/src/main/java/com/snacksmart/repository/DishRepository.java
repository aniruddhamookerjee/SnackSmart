package com.snacksmart.repository;

import com.snacksmart.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByDishNameContainingIgnoreCase(String name);
    @Query("SELECT d FROM Dish d WHERE d.restaurant.id = :restaurantId")
    List<Dish> findByRestaurantId(@Param("restaurantId") Long restaurantId);
    @Query("SELECT COUNT(d) FROM Dish d WHERE d.restaurant.id = :restaurantId")
    Long countByRestaurantId(@Param("restaurantId") Long restaurantId);
}