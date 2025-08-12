package com.giproject.dto.fees;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesDTO {

	private Long id;
    private String type;
    private String category;
    private String distance;
    private Integer price;
}
