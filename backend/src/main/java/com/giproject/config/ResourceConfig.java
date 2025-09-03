// src/main/java/com/giproject/config/ResourceConfig.java
package com.giproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 실행 위치가 달라도 같은 곳을 보도록 후보 2개 중 존재하는 쪽 선택
        Path rootA = Paths.get("../uploads").toAbsolutePath().normalize();
        Path rootB = Paths.get("uploads").toAbsolutePath().normalize();
        Path chosen = Files.isDirectory(rootA) ? rootA : rootB;

        String rootUri   = chosen.toUri().toString();                   // file:/D:/123/2team_project/uploads/
        String profileUri= chosen.resolve("user_profile").toUri().toString();
        String cargoUri  = chosen.resolve("cargo").toUri().toString();

        System.out.println(">>> STATIC ROOT        = " + rootUri);
        System.out.println(">>> STATIC user_profile= " + profileUri);
        System.out.println(">>> STATIC cargo       = " + cargoUri);

        // 전체 uploads 공개 (이 한 줄이면 사실 충분)
        registry.addResourceHandler("/g2i4/uploads/**")
                .addResourceLocations(rootUri);

        // 디버깅 명확성을 위해 서브 경로도 명시 (중복 등록 무방)
        registry.addResourceHandler("/g2i4/uploads/user_profile/**")
                .addResourceLocations(profileUri);
        registry.addResourceHandler("/g2i4/uploads/cargo/**")
                .addResourceLocations(cargoUri);
    }
}
