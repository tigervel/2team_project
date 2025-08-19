package com.giproject.controller.admin;

import com.giproject.dto.admin.AdminMemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
	private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    /** 물주 목록 */
    @GetMapping("/Owners")
    public Page<AdminMemberDTO> owners(Pageable pageable) {
        return memberRepository.findAll(pageable)
                .map(this::toOwnerDTO);
    }

    /** 차주 목록 */
    @GetMapping("/Cowners")
    public Page<AdminMemberDTO> cowners(Pageable pageable) {
        return cargoOwnerRepository.findAll(pageable)
                .map(this::toCownerDTO);
    }

    // ====== 매핑 ======
    private AdminMemberDTO toOwnerDTO(Member m) {
        return new AdminMemberDTO(
                m.getMemName(),
                m.getMemEmail(),
                m.getMemPhone(),
                m.getMemCreateIdDateTime()
        );
    }

    private AdminMemberDTO toCownerDTO(CargoOwner c) {
        return new AdminMemberDTO(
                c.getCargoName(),
                c.getCargoEmail(),
                c.getCargoPhone(),
                c.getCargoCreatedDateTime()
        );
    }
}