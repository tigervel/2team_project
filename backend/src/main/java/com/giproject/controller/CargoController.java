package com.giproject.controller;

import com.giproject.dto.cargo.CargoDTO;
import com.giproject.entity.cargo.Cargo;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.cargo.CargoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/g2i4/cargo")
@RequiredArgsConstructor
public class CargoController {

    private final CargoRepository cargoRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    /**
     * 차량 목록 조회 (소유자 ID 기준)
     */
    @GetMapping("/list/{cargoId}")
    public ResponseEntity<List<Cargo>> getCargoList(@PathVariable("cargoId") String cargoId) {
        List<Cargo> list = cargoRepository.findByCargoOwner_CargoId(cargoId);
        return ResponseEntity.ok(list);
    }

    /**
     * 차량 등록
     */
    @PostMapping("/add/{cargoId}")
    public ResponseEntity<?> registerCargo(@PathVariable("cargoId") String cargoId, @RequestBody CargoDTO dto) {
        try {
            CargoOwner owner = cargoOwnerRepository.findById(cargoId)
                    .orElseThrow(() -> new RuntimeException("소유자 없음"));

            Cargo cargo = new Cargo();
            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());
            cargo.setCargoCapacity(dto.getWeight());
            cargo.setCargoOwner(owner);

            Cargo saved = cargoRepository.save(cargo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body("등록 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 수정
     */
    @PutMapping("/update/{cargoNo}")
    public ResponseEntity<?> updateCargo(@PathVariable("cargoNo") Integer cargoNo, @RequestBody CargoDTO dto) {
        try {
            Cargo cargo = cargoRepository.findById(cargoNo)
                    .orElseThrow(() -> new IllegalArgumentException("차량 없음: " + cargoNo));

            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());
            cargo.setCargoCapacity(dto.getWeight());

            Cargo updated = cargoRepository.save(cargo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("차량 수정 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 삭제
     */
    @DeleteMapping("/delete/{cargoNo}")
    public ResponseEntity<?> deleteCargo(@PathVariable("cargoNo") Integer cargoNo) {
        try {
            cargoRepository.deleteById(cargoNo);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("삭제 실패: " + e.getMessage());
        }
    }

    /**
     * 이미지 업로드
     */
    @PostMapping("/upload/{cargoNo}")
    public ResponseEntity<?> uploadImage(@PathVariable Integer cargoNo, @RequestParam("image") MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("src/main/resources/static/uploads/" + fileName);

            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, file.getBytes());

            // DB에 상대 경로 저장
            Cargo cargo = cargoRepository.findById(cargoNo).orElseThrow();
            cargo.setCargoImage("/uploads/" + fileName);
            cargoRepository.save(cargo);

            return ResponseEntity.ok("업로드 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("이미지 업로드 실패: " + e.getMessage());
        }
    }
}