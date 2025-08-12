package com.giproject.controller.fees;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.fees.FeesDTO;
import com.giproject.service.fees.FeesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/fees")
@RequiredArgsConstructor
public class FeesController {

    private final FeesService feesService;

    @PostMapping
    public FeesDTO createFees(@RequestBody FeesDTO dto) {
        return feesService.saveOrUpdate(dto);
    }

    @PutMapping("/{id}")
    public FeesDTO updateFees(@PathVariable Long id, @RequestBody FeesDTO dto) {
        dto.setId(id);
        return feesService.saveOrUpdate(dto);
    }

    @GetMapping("/{type}")
    public List<FeesDTO> getFees(@PathVariable String type) {
        return feesService.getFeesByType(type);
    }
}
