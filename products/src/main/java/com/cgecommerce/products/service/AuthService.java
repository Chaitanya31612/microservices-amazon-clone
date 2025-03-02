package com.cgecommerce.products.service;

import com.cgecommerce.products.model.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class AuthService {
    private final WebClient webClient;
    private String authBaseURL;

    public AuthService(WebClient.Builder webClientBuilder) {
        this.authBaseURL = "http://auth-srv:3000";
        System.out.println("AUTH url is " + authBaseURL);
        webClient = webClientBuilder.baseUrl(authBaseURL).build();
    }

    public Mono<UserPrincipal> getCurrentUser(String sessionCookieValue) {
        return webClient.get()
                .uri("/api/users/currentuser")
                .cookie("session", sessionCookieValue)
                .retrieve()
                .bodyToMono(UserPrincipal.class)
                .onErrorResume(e -> {
                    System.err.println("Error getting current user: " + e.getMessage());
                    return Mono.empty();
                });
    }
}
