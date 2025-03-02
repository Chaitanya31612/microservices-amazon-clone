package com.cgecommerce.products.config;

import com.cgecommerce.products.model.UserPrincipal;
import com.cgecommerce.products.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import reactor.netty.http.Cookies;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private final AuthService authService;

    public JwtRequestFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        String sessionCookieValue = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("session".equals(cookie.getName())) {
                    sessionCookieValue = cookie.getValue();
                    break;
                }
            }
        }
        System.out.println("session cookie value - " + sessionCookieValue);

        if(sessionCookieValue != null) {
            try {
                UserPrincipal userPrincipal = authService.getCurrentUser(sessionCookieValue).block();
                System.out.println("UserPrincipal is " + userPrincipal);

                if(userPrincipal != null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userPrincipal,
                                    null,
                                    userPrincipal.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                logger.error("Error getting current user from auth service");
            }
        }

        filterChain.doFilter(request, response);
    }
}
