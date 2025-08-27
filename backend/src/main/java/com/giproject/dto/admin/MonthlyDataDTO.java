package com.giproject.dto.admin;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MonthlyDataDTO {

    private String month;
    private Long count;

    public MonthlyDataDTO(String month, Long count) {
    	System.out.println(month);
        this.month = month;
        this.count = count;
    }
}
