package com.giproject.service.admin;

import java.util.List;

import com.giproject.dto.admin.AdminMemberSearchDTO;

public interface AdminDeliveryService {
    List<AdminMemberSearchDTO> searchUserForDeliveryPage(String query);
}

