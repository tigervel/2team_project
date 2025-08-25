package com.giproject.service.admin;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.admin.DashboardDataDTO;
import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.repository.admin.AdminCargoOwnerRepository;
import com.giproject.repository.admin.AdminMemberRepository;
import com.giproject.repository.admin.AdminOrderRepository;
import com.giproject.repository.admin.AdminPaymentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {
    
    private final AdminMemberRepository adminMemberRepository;
    private final AdminCargoOwnerRepository adminCargoOwnerRepository;
    private final AdminOrderRepository adminOrderRepository;
    private final AdminPaymentRepository adminPaymentRepository;

    @Override
    public DashboardDataDTO dashboardDataDTO() {
        // 1. 총 사용자 수
    	long totalUsers = adminMemberRepository.count() + adminCargoOwnerRepository.count();

        // 2. 이번 달 매출
    	long monthlyRevenue = adminPaymentRepository.findTotalMonthlyRevenue(LocalDate.now()).orElse(0L);

        // 3. 총 배송 건
        long totalDeliveries = adminOrderRepository.count();

        // 4. 신규 회원가입 수
        long newMembersThisMonth = adminMemberRepository.countNewMembersByDate(LocalDate.now());
        long newCargoOwnersThisMonth = adminCargoOwnerRepository.countNewCargoOwnersByDate(LocalDate.now());
        long newMembers = newMembersThisMonth + newCargoOwnersThisMonth;

        // 5. 월별 배송 내역 차트
        // 리포지토리에서 이미 DTO로 변환하여 가져오므로 별도 매핑 로직 불필요
        List<MonthlyDataDTO> monthlyDeliveries = adminOrderRepository.findMonthlyDeliveryCounts();

        // 6. 월별 신규 회원가입 차트
        List<MonthlyDataDTO> memberMonthly = adminMemberRepository.findMonthlyNewMemberCounts();
        List<MonthlyDataDTO> cargoMonthly  = adminCargoOwnerRepository.findMonthlyNewCargoOwnerCounts();

        List<MonthlyDataDTO> newMembersByMonth = mergeMonthly(memberMonthly, cargoMonthly);
        
        // 배송 현황 추가 예정
        
        return DashboardDataDTO.builder()
                .totalUsers(totalUsers)
                .monthlyRevenue(monthlyRevenue)
                .totalDeliveries(totalDeliveries)
                .newMembers(newMembers)
                .monthlyDeliveries(monthlyDeliveries)
                .newMembersByMonth(newMembersByMonth)
                .build();
    }
    
    /** 두 월별 리스트(동일 포맷 "YYYY-MM") 합산 + 정렬 */
    private List<MonthlyDataDTO> mergeMonthly(List<MonthlyDataDTO> a, List<MonthlyDataDTO> b) {
        Map<String, Long> map = new java.util.HashMap<>();
        if (a != null) for (MonthlyDataDTO d : a) map.merge(d.getMonth(), d.getCount(), Long::sum);
        if (b != null) for (MonthlyDataDTO d : b) map.merge(d.getMonth(), d.getCount(), Long::sum);

        return map.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new MonthlyDataDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }
}