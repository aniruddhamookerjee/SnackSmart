package com.snacksmart.repository;

import com.snacksmart.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    long countByStatus(Restaurant.Status status);
}