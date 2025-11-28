package com.snacksmart.repository;

import com.snacksmart.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurantId = :restaurantId")
    Float findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);
}