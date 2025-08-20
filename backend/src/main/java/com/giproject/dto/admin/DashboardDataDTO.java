package com.giproject.dto.admin;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDataDTO {
	
	private long totalUsers;
    private long monthlyRevenue;
    private long totalDeliveries;
    private long newMembers;
    private List<MonthlyDataDTO> monthlyDeliveries;
    private List<MonthlyDataDTO> newMembersByMonth;
    private List<String> currentDeliveries;
    private List<String> pastDeliveries;
}
