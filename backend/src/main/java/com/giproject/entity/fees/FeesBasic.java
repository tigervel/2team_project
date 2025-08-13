package com.giproject.entity.fees;
//기본 요금
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "feesBasic", uniqueConstraints = @UniqueConstraint(columnNames = {"weight"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesBasic {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long tno;

	// 트럭 중량
	@Column(nullable = false, length = 50)
	private String weight;

	//거리별 요금
	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal ratePerKm;
	
	// 기본요금
	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal initialCharge;

	// 수정일
	private LocalDateTime updatedAt;
}