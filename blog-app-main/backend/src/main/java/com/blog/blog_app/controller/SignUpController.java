package com.blog.blog_app.controller;

import com.blog.blog_app.dto.SignUpRequest;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.repository.SignUpRepository;
import com.blog.blog_app.service.SignUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class SignUpController {

    private static final Logger logger = LoggerFactory.getLogger(SignUpController.class);

    @Autowired
    private SignUpService userService;

    @Autowired
    private SignUpService signUpService;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignUpRequest signupRequest) {
        logger.info("Received signup request for email: {}", signupRequest.getEmail());

        try {
            if (userService.emailExists(signupRequest.getEmail())) {
                logger.warn("Email already in use: {}", signupRequest.getEmail());
                return ResponseEntity.badRequest().body("Email already in use!");
            }

            SignUpModel savedUser = userService.registerNewUser(signupRequest);
            logger.info("User saved successfully with ID: {}", savedUser.getId());

            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            logger.error("Error during user registration: ", e);
            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/getUserNames")
    public ResponseEntity<Map<String, List<String>>> getUsernamesByIds(@RequestParam List<Integer> userIds) {
        System.out.println("Received userIds: " + userIds); // Log userIds

        List<SignUpModel> users = signUpService.getUsersByIds(userIds);

        // If users are found, log usernames
        List<String> usernames = users.stream()
                .map(SignUpModel::getUsername)
                .collect(Collectors.toList());

        System.out.println("Returning usernames: " + usernames); // Log usernames

        return ResponseEntity.ok(Map.of("usernames", usernames));
    }

}