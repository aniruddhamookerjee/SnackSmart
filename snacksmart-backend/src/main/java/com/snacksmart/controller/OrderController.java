package com.snacksmart.controller;

import com.snacksmart.entity.Order;
import com.snacksmart.entity.OrderItem;
import com.snacksmart.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> orderData) {
        try {
            Order order = new Order();
            order.setCustomerId(Long.valueOf(orderData.get("customerId").toString()));
            order.setRestaurantId(Long.valueOf(orderData.get("restaurantId").toString()));
            order.setTotalAmount(new BigDecimal(orderData.get("totalAmount").toString()));
            order.setPickupTime(LocalDateTime.now().plusMinutes(30)); // 30 min pickup time
            
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error placing order: " + e.getMessage());
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderRepository.findByCustomerId(customerId));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getRestaurantOrders(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderRepository.findByRestaurantId(restaurantId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> statusData) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            order.setStatus(Order.OrderStatus.valueOf(statusData.get("status")));
            orderRepository.save(order);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating status: " + e.getMessage());
        }
    }
}