package com.giproject.entity.fees;
//추가 요금
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "feesExtra", uniqueConstraints = @UniqueConstraint(columnNames = {"extraChargeTitle"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesExtra {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long exno;

    // 타입
    @Column(nullable = false, length = 50)
    private String extraChargeTitle;

    //추가 금액
  	@Column(nullable = false, precision = 12, scale = 2)
  	private BigDecimal extraCharge;

    //수정일
    private LocalDateTime updatedAt;
}