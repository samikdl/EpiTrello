package com.epitrello.controller;

import com.epitrello.model.User;
import com.epitrello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);
        
        if (user != null && user.getPassword().equals(loginRequest.getPassword())) {
            return "Connexion réussie pour : " + user.getUsername();
        }
        return "Échec de connexion";
    }
}