package com.giproject.service.admin;

import com.giproject.dto.admin.AdminLoginDTO;
import com.giproject.entity.admin.Admin;

public interface AdminService {
	
	Admin login(AdminLoginDTO adminLoginDTO);//관리자 로그인
	
	boolean isAdminExists(String admin);//아이디 중복 확인
}
