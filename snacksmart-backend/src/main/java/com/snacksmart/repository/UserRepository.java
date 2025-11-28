package com.snacksmart.repository;

import com.snacksmart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    long countByRole(User.Role role);
    long countByStatus(User.Status status);
}