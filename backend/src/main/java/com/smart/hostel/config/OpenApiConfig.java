package com.smart.hostel.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

        @Value("${app.backend.url}")
        private String backendUrl;

        @Bean
        public OpenAPI myOpenAPI() {
                Server devServer = new Server();
                devServer.setUrl(backendUrl);
                devServer.setDescription("Server URL in Development environment");

                Info info = new Info()
                                .title("Smart Hostel Management API")
                                .version("1.0")
                                .description("This API exposes endpoints to manage the Smart Hostel Ecosystem.")
                                .license(new License().name("MIT License")
                                                .url("https://choosealicense.com/licenses/mit/"));

                io.swagger.v3.oas.models.security.SecurityRequirement securityRequirement = new io.swagger.v3.oas.models.security.SecurityRequirement()
                                .addList("Bearer Authentication");

                io.swagger.v3.oas.models.Components components = new io.swagger.v3.oas.models.Components()
                                .addSecuritySchemes("Bearer Authentication",
                                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                                                .name("Bearer Authentication")
                                                                .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT"));

                return new OpenAPI().info(info).servers(List.of(devServer))
                                .addSecurityItem(securityRequirement)
                                .components(components);
        }
}
