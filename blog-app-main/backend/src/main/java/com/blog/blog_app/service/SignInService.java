package com.blog.blog_app.service;

import com.blog.blog_app.dto.SignInRequest;
import com.blog.blog_app.model.SignUpModel;
import com.blog.blog_app.repository.SignUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;

@Service
public class SignInService {

    private static final Logger logger = LoggerFactory.getLogger(SignInService.class);

    @Autowired
    private SignUpRepository userRepository;

    public Optional<SignUpModel> getUser(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean validateUser(SignInRequest signInRequest) {
        Optional<SignUpModel> userOpt = getUser(signInRequest.getEmail());
        return userOpt.isPresent() &&
                userOpt.get().getPassword().equals(signInRequest.getPassword());
    }
}