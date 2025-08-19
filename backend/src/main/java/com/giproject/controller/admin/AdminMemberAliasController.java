package com.giproject.controller.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import lombok.RequiredArgsConstructor;

import com.giproject.dto.admin.AdminMemberDTO;
import com.giproject.service.admin.AdminMemberService;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class AdminMemberAliasController {

    private final AdminMemberService adminMemberService;

    // 기존 컨트롤러: @RequestMapping("/api/admin/members") 가 이미 있음
    // 추가 별칭: /g2i4/admin/users 로도 같은 핸들러 제공

    @GetMapping("/g2i4/admin/users")
    public Page<AdminMemberDTO> aliasList(
            @RequestParam(name="type", defaultValue="ALL") String type,
            @RequestParam(name="keyword", required=false) String keyword,
            @PageableDefault(size=10, sort="memCreateidDateTime", direction = Sort.Direction.DESC) Pageable pageable
    ){
        return adminMemberService.list(type, keyword, pageable);
    }
}