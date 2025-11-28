package com.snacksmart.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "dishes")
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dish_id")
    private Long id;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "name")
    private String dishName;
    
    private Double price;
    
    @Column(name = "veg")
    private Boolean veg = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    @JsonBackReference
    private Restaurant restaurant;

    // Constructors
    public Dish() {}

    public Dish(String dishName, Double price, Boolean veg) {
        this.dishName = dishName;
        this.price = price;
        this.veg = veg;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDishName() { return dishName; }
    public void setDishName(String dishName) { this.dishName = dishName; }

    public Boolean getIsAvailable() {
    return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
    this.isAvailable = isAvailable;
    }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Boolean getVeg() { return veg; }
    public void setVeg(Boolean veg) { this.veg = veg; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    
    public Long getRestaurantId() {
        return restaurant != null ? restaurant.getId() : null;
    }
}