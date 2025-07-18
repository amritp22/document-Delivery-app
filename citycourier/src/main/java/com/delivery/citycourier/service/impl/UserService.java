package com.delivery.citycourier.service.impl;



import com.delivery.citycourier.dto.*;
import com.delivery.citycourier.model.User;
import com.delivery.citycourier.repository.UserRepository;
import com.delivery.citycourier.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(
            org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build(),
            user.getRole().name()
        );

        return new AuthResponse(token, user.getRole().name(), user.getName(),user.getId());
    }


    public AuthResponse authenticate(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
            String token = jwtUtil.generateToken(
                org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .build(),
                user.getRole().name()
            );

            return new AuthResponse(token, user.getRole().name(), user.getName(),user.getId());
        } catch (Exception ex) {
            ex.printStackTrace();  // log in console
            throw new RuntimeException("Login failed: " + ex.getMessage());
        }
    }

}

