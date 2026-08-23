package com.snacksmart.repository;

import com.snacksmart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByRestaurantId(Long restaurantId);
    long countByCreatedAtAfter(LocalDateTime dateTime);
    List<Order> findByRestaurantIdAndCreatedAtAfter(Long restaurantId, LocalDateTime dateTime);
}