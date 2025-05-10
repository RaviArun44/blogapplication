package com.blog.blog_app.controller;

import com.blog.blog_app.dto.SignInRequest;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.service.SignInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class SignInController {

    private static final Logger logger = LoggerFactory.getLogger(SignInController.class);

    @Autowired
    private SignInService signInService;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SignInRequest signInRequest) {
        logger.info("Received signin request for email: {}", signInRequest.getEmail());

        try {
            Optional<SignUpModel> userOptional = signInService.getUser(signInRequest.getEmail());

            if (userOptional.isPresent()) {
                SignUpModel user = userOptional.get();

                if (user.getPassword().equals(signInRequest.getPassword())) {
                    logger.info("User authenticated successfully: {}", user.getEmail());

                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("name", user.getUsername());
                    response.put("email", user.getEmail());

                    return ResponseEntity.ok(response);
                }
            }

            logger.warn("Authentication failed for email: {}", signInRequest.getEmail());
            return ResponseEntity.badRequest().body("Invalid email or password");

        } catch (Exception e) {
            logger.error("Error during authentication: ", e);
            return ResponseEntity.internalServerError().body("Authentication failed: " + e.getMessage());
        }
    }

}