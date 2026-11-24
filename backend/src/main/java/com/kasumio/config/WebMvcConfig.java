package com.kasumio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC Configuration for serving uploaded static assets like avatars.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String uriString = uploadDir.toUri().toString();
        if (!uriString.endsWith("/")) {
            uriString += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uriString, "file:uploads/", "file:backend/uploads/");
    }
}
