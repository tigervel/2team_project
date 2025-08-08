package com.giproject.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.service.admin.AdminService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/admin")
@Log4j2
//@RequiredArgsConstructor
//@PreAuthorize("hasAuthority('ROLE_ADMIN')")//admin 만 가능
public class AdminController {

	private final AdminService adminService;
	
	@PostMapping("/login")
	public ResponseEntity<>

}
