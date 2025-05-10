package com.blog.blog_app.repository;

import com.blog.blog_app.model.PostModel;
import com.blog.blog_app.model.SignUpModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SignUpRepository extends JpaRepository<SignUpModel, Integer> {
    boolean existsByEmail(String email);

    Optional<SignUpModel> findByEmail(String email);

    boolean existsByUsername(String username);

    Optional<SignUpModel> findByUsername(String username);

    Optional<PostModel> findById(int userId);

}