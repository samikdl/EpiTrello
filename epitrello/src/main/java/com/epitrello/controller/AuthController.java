package com.epitrello.controller;

import com.epitrello.model.User;
import com.epitrello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nom d'utilisateur déjà pris");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent() && userOptional.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.ok("Connexion réussie pour : " + userOptional.get().getUsername());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Échec de connexion");
    }
}