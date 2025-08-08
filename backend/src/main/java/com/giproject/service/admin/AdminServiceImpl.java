package com.giproject.service.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.admin.AdminLoginDTO;
import com.giproject.entity.admin.Admin;
import com.giproject.repository.admin.AdminRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

	private final AdminRepository adminRepository;

	@Override
	public Admin login(AdminLoginDTO adminLoginDTO) {
		String adminId = adminLoginDTO.getAdmin();
		String adminPw = adminLoginDTO.getAdPw();

		return adminRepository.findByAdminAndAdPw(adminId, adminPw)
				.orElseThrow(() -> new RuntimeException("관리자 로그인 실패"));
	}

	@Override
	public boolean isAdminExists(String admin) {
		return adminRepository.existsByAdmin(admin);
	}
}
