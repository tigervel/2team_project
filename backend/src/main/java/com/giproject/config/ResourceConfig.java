<<<<<<< HEAD
// src/main/java/com/giproject/config/ResourceConfig.java
=======
>>>>>>> 2688c91e24ea972a6bf5b912a33a86fc32ff73d9
package com.giproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

<<<<<<< HEAD
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
=======
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
@Configuration
public class ResourceConfig implements WebMvcConfigurer {

    private Path resolveUploadRoot() {
        Path rootA = Paths.get("../uploads").toAbsolutePath().normalize();
        Path rootB = Paths.get("uploads").toAbsolutePath().normalize();
        if (Files.isDirectory(rootA)) return rootA;
        if (Files.isDirectory(rootB)) return rootB;
        // 없으면 rootB를 우선 생성 시도
        try {
            Files.createDirectories(rootB);
            return rootB;
        } catch (IOException e) {
            return rootA; // 최후의 fallback
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path chosen = resolveUploadRoot();

        String rootUri    = chosen.toUri().toString();
        String profileUri = chosen.resolve("user_profile").toUri().toString();
        String cargoUri   = chosen.resolve("cargo").toUri().toString();
>>>>>>> 2688c91e24ea972a6bf5b912a33a86fc32ff73d9

        System.out.println(">>> STATIC ROOT        = " + rootUri);
        System.out.println(">>> STATIC user_profile= " + profileUri);
        System.out.println(">>> STATIC cargo       = " + cargoUri);

<<<<<<< HEAD
        // 전체 uploads 공개 (이 한 줄이면 사실 충분)
        registry.addResourceHandler("/g2i4/uploads/**")
                .addResourceLocations(rootUri);

        // 디버깅 명확성을 위해 서브 경로도 명시 (중복 등록 무방)
        registry.addResourceHandler("/g2i4/uploads/user_profile/**")
                .addResourceLocations(profileUri);
=======
        registry.addResourceHandler("/g2i4/uploads/**")
                .addResourceLocations(rootUri);

        registry.addResourceHandler("/g2i4/uploads/user_profile/**")
                .addResourceLocations(profileUri);

>>>>>>> 2688c91e24ea972a6bf5b912a33a86fc32ff73d9
        registry.addResourceHandler("/g2i4/uploads/cargo/**")
                .addResourceLocations(cargoUri);
    }
}
