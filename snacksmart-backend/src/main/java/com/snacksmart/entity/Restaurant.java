package com.snacksmart.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Long id;

    private String name;
    
    @Column(name = "location")
    private String address;
    
    @Column(name = "owner_id")
    private Long ownerId;
    
    private String phone;
    
    @Transient
    private Double rating = 4.0;
    
    @Transient
    private Boolean veg = true;
    
    @Transient
    private Boolean nonVeg = true;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
    
    public enum Status {
        ACTIVE, BLOCKED
    }

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Dish> menu = new ArrayList<>();

    // Constructors
    public Restaurant() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Boolean getVeg() { return veg; }
    public void setVeg(Boolean veg) { this.veg = veg; }

    public Boolean getNonVeg() { return nonVeg; }
    public void setNonVeg(Boolean nonVeg) { this.nonVeg = nonVeg; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public List<Dish> getMenu() { return menu; }
    public void setMenu(List<Dish> menu) { 
        this.menu = menu;
        if (menu != null) {
            for (Dish dish : menu) {
                dish.setRestaurant(this);
            }
        }
    }
}