package com.giproject.service.admin;

import com.giproject.dto.admin.AdminMemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class AdminMemberServiceImpl implements AdminMemberService {

	private final MemberRepository memberRepository;
	private final CargoOwnerRepository cargoOwnerRepository;

	public Page<AdminMemberDTO> list(String type, String keyword, Pageable pageable) {
		String t = (type == null ? "all" : type.trim()).toUpperCase(Locale.ROOT);
		boolean hasKeyword = keyword != null && !keyword.isBlank();

		log.info("[Service] list IN type={}, hasKeyword={}, pageable={}", t, hasKeyword, pageable);

		List<AdminMemberDTO> rows;
		try {
			switch (t) {
			case "OWNER" -> rows = toOwners(hasKeyword ? keyword : null);
			case "COWNER" -> rows = toCowners(hasKeyword ? keyword : null);
			case "ADMIN" -> rows = toAdmins(hasKeyword ? keyword : null);
			default -> {
				List<AdminMemberDTO> merged = new ArrayList<>();
				merged.addAll(toOwners(hasKeyword ? keyword : null));
				merged.addAll(toCowners(hasKeyword ? keyword : null));
				merged.addAll(toAdmins(hasKeyword ? keyword : null));
				rows = merged;
			}
			}
		} catch (Exception e) {
			log.error("[Service] building rows failed: type={}, keyword={}", t, keyword, e);
			throw e;
		}

		log.info("[Service] rows.size={}", (rows == null ? -1 : rows.size()));

		// 정렬
		if (pageable != null && pageable.getSort().isSorted() && rows != null && rows.size() > 1) {
			for (Sort.Order o : pageable.getSort()) {
				String prop = o.getProperty();
				boolean asc = o.isAscending();
				log.info("[Service] sort by {} {}", prop, asc ? "ASC" : "DESC");

				Comparator<AdminMemberDTO> comparator = null;
				if ("memCreateidDateTime".equalsIgnoreCase(prop)) {
					comparator = Comparator.comparing((AdminMemberDTO dto) -> Optional
							.ofNullable(dto.getMemCreateidDateTime()).orElse(LocalDateTime.MIN));
				} else if ("memName".equalsIgnoreCase(prop)) {
					comparator = Comparator
							.comparing((AdminMemberDTO dto) -> Optional.ofNullable(dto.getMemName()).orElse(""));
				} else if ("memId".equalsIgnoreCase(prop)) {
					comparator = Comparator
							.comparing((AdminMemberDTO dto) -> Optional.ofNullable(dto.getMemId()).orElse(""));
				}
				if (comparator != null) {
					if (!asc)
						comparator = comparator.reversed();
					try {
						rows.sort(comparator);
					} catch (Exception e) {
						log.error("[Service] sort failed: prop={}", prop, e);
					}
				}
			}
		}

		int page = pageable == null ? 0 : pageable.getPageNumber();
		int size = pageable == null ? 20 : pageable.getPageSize();
		int from = Math.min(page * size, rows.size());
		int to = Math.min(from + size, rows.size());
		List<AdminMemberDTO> slice = rows.subList(from, to);

		Page<AdminMemberDTO> result = new PageImpl<>(slice, (pageable == null ? PageRequest.of(0, size) : pageable),
				rows.size());

		log.info("[Service] OUT totalElements={}, totalPages={}, slice={}", result.getTotalElements(),
				result.getTotalPages(), slice.size());
		return result;
	}

	@Override
	public Page<AdminMemberDTO> owners(String keyword, Pageable pageable) {
		return list("OWNER", keyword, pageable);
	}

	@Override
	public Page<AdminMemberDTO> cowners(String keyword, Pageable pageable) {
		return list("COWNER", keyword, pageable);
	}

	@Override
	public Page<AdminMemberDTO> admins(String keyword, Pageable pageable) {
		return list("ADMIN", keyword, pageable);
	}

	private List<AdminMemberDTO> toOwners(String keyword) {
		List<Member> list = memberRepository.findAll();
		if (keyword != null && !keyword.isBlank()) {
			String k = keyword.trim();
			list = list.stream()
					.filter(m -> containsIgnoreCase(m.getMemId(), k) || containsIgnoreCase(m.getMemName(), k)
							|| containsIgnoreCase(m.getMemEmail(), k) || containsIgnoreCase(m.getMemPhone(), k))
					.collect(Collectors.toList());
		}
		list = list.stream().filter(m -> !containsRole(m, "ADMIN")).collect(Collectors.toList());

		return list.stream().map(this::ownerToDto).collect(Collectors.toList());
	}

	private List<AdminMemberDTO> toAdmins(String keyword) {
		List<Member> list = memberRepository.findAll();
		// 관리자만
		list = list.stream().filter(m -> containsRole(m, "ADMIN")).collect(Collectors.toList());

		if (keyword != null && !keyword.isBlank()) {
			String k = keyword.trim();
			list = list.stream()
					.filter(m -> containsIgnoreCase(m.getMemId(), k) || containsIgnoreCase(m.getMemName(), k)
							|| containsIgnoreCase(m.getMemEmail(), k) || containsIgnoreCase(m.getMemPhone(), k))
					.collect(Collectors.toList());
		}
		return list.stream().map(this::adminToDto).collect(Collectors.toList());
	}

	private List<AdminMemberDTO> toCowners(String keyword) {
		List<CargoOwner> list = cargoOwnerRepository.findAll();
		if (keyword != null && !keyword.isBlank()) {
			String k = keyword.trim();
			list = list.stream()
					.filter(c -> containsIgnoreCase(c.getCargoId(), k) || containsIgnoreCase(c.getCargoName(), k)
							|| containsIgnoreCase(c.getCargoEmail(), k) || containsIgnoreCase(c.getCargoPhone(), k))
					.collect(Collectors.toList());
		}
		return list.stream().map(this::cownerToDto).collect(Collectors.toList());
	}

	private AdminMemberDTO ownerToDto(Member m) {
		return AdminMemberDTO.builder().type("OWNER").memId(nullToEmpty(m.getMemId()))
				.memName(nullToEmpty(m.getMemName())).memEmail(nullToEmpty(m.getMemEmail()))
				.memPhone(nullToEmpty(m.getMemPhone())).memAdress(nullToEmpty(m.getMemAddress()))
				.memCreateidDateTime(m.getMemCreateIdDateTime()).build();
	}

	private AdminMemberDTO adminToDto(Member m) {
		return AdminMemberDTO.builder().type("ADMIN").memId(nullToEmpty(m.getMemId()))
				.memName(nullToEmpty(m.getMemName())).memEmail(nullToEmpty(m.getMemEmail()))
				.memPhone(nullToEmpty(m.getMemPhone())).memAdress(nullToEmpty(m.getMemAddress()))
				.memCreateidDateTime(m.getMemCreateIdDateTime()).build();
	}

	private AdminMemberDTO cownerToDto(CargoOwner c) {
		return AdminMemberDTO.builder().type("COWNER").memId(nullToEmpty(c.getCargoId()))
				.memName(nullToEmpty(c.getCargoName())).memEmail(nullToEmpty(c.getCargoEmail()))
				.memPhone(nullToEmpty(c.getCargoPhone())).memAdress(nullToEmpty(c.getCargoAddress()))
				.memCreateidDateTime(c.getCargoCreatedDateTime()).build();
	}

	private static String nullToEmpty(String s) {
		return s == null ? "" : s;
	}
	
	private boolean contains(String s, String needleLower) {
		return s != null && s.toLowerCase(Locale.ROOT).contains(needleLower);
	}

	private boolean containsRole(Member m, String role) {
		if (m.getMemberRoleList() == null)
			return false;
		String want = role.toUpperCase(Locale.ROOT);
		String wantWithPrefix = ("ROLE_" + role).toUpperCase(Locale.ROOT);
		for (String r : m.getMemberRoleList()) {
			if (r == null)
				continue;
			String rr = r.toUpperCase(Locale.ROOT);
			if (rr.equals(want) || rr.equals(wantWithPrefix))
				return true;
		}
		return false;
	}

	private static boolean containsIgnoreCase(String src, String kw) {
		if (src == null || kw == null)
			return false;
		return src.toLowerCase().contains(kw.toLowerCase());
	}
}