package com.example.app.config;

import com.example.app.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Spring Security 設定。
 * セキュリティチェーンを2本に分離している:
 *   1. h2ConsoleSecurityFilterChain … dev プロファイル限定。H2 コンソール専用の緩和設定。
 *   2. appSecurityFilterChain        … 常時有効。アプリ本体の認証設定。
 * H2 コンソールの無認証開放・CSRF無効・フレーム許可は開発時のみに閉じ込め、
 * 本番(dev無し)ではこれらの緩和を一切適用しない。
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 開発用: H2 コンソール専用のセキュリティチェーン。
     * dev プロファイル有効時のみ生成され、/h2-console/** に限って
     * 認証不要・CSRF無効・同一オリジンフレーム許可を適用する。
     * 本番(dev無し)ではこの Bean 自体が存在せず、/h2-console は
     * appSecurityFilterChain 側で認証必須となる（=実質アクセス不可）。
     */
    @Bean
    @Order(1)
    @Profile("dev")
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(new AntPathRequestMatcher("/h2-console/**"))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        return http.build();
    }

    /**
     * アプリ本体のセキュリティチェーン。
     * 認証ページ・静的アセットのみ許可し、それ以外は認証必須。
     * CSRF は有効、フレーム表示はデフォルト(DENY)としクリックジャッキングを防ぐ。
     */
    @Bean
    @Order(2)
    public SecurityFilterChain appSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/login",
                                "/auth/register",
                                "/css/**",
                                "/js/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/auth/login")
                        .loginProcessingUrl("/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .defaultSuccessUrl("/", true)
                        .failureUrl("/auth/login?error")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
                        .logoutSuccessUrl("/auth/login?logout")
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
