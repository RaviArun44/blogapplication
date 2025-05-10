package com.blog.blog_app.service;

import com.blog.blog_app.dto.SignUpRequest;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.repository.SignUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SignUpService {

    private static final Logger logger = LoggerFactory.getLogger(SignUpService.class);

    @Autowired
    private SignUpRepository userRepository;

    @Transactional
    public SignUpModel registerNewUser(SignUpRequest signUpRequest) {
        logger.info("Registering new user with email: {}", signUpRequest.getEmail());

        SignUpModel user = new SignUpModel();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());

        return userRepository.save(user);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Autowired
    private SignUpRepository signUpRepository;

    @CrossOrigin(origins = "http://localhost:5173")
    public List<SignUpModel> getUsersByIds(List<Integer> userIds) {
        return signUpRepository.findAllById(userIds);
    }

}