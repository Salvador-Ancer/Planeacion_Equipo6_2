package com.springboot.MyTodoList.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration {

    private final JwtRequestFilter jwtRequestFilter;

    public WebSecurityConfiguration(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas — login, registro y health check
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/actuator/health/**").permitAll()
                // Swagger — solo accesible en desarrollo
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Archivos estáticos del frontend (SPA)
                .requestMatchers(
                    "/", "/index.html", "/assets/**",
                    "/*.js", "/*.css", "/icons.svg"
                ).permitAll()
                // Cualquier otra ruta requiere JWT válido
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable())
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        // X-Content-Type-Options: nosniff está habilitado por defecto en Spring Security.
        // Solo sobreescribimos frameOptions para bloquear clickjacking.
        http.headers(headers -> headers
            .frameOptions(frame -> frame.deny())
        );

        return http.build();
    }
}