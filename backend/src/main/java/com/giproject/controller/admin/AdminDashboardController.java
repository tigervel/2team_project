package com.giproject.controller.admin;

import com.giproject.dto.admin.DashboardDataDTO;
import com.giproject.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
@RequestMapping("/g2i4/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<DashboardDataDTO> getDashboardData() {
        DashboardDataDTO dashboardData = adminDashboardService.dashboardDataDTO();
        return ResponseEntity.ok(dashboardData);
    }
}