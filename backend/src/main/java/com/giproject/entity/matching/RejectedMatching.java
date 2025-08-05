package com.giproject.entity.matching;

import java.time.LocalDateTime;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "RejectedMatching")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RejectedMatching {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long rmno;//매칭 거절 리스트
	
	@ManyToOne
	@JoinColumn(name = "cargo_owner_id")
	private CargoOwner cargoOwner;
	
	@ManyToOne
	@JoinColumn(name = "estimate_no")
	private Estimate estimate;
	
	private LocalDateTime rejectedTime;
}
