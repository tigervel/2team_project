package com.giproject.entity.estimate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TempEstimate")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TempEstimate {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long saveNo;
	
	@OneToOne
	@JoinColumn(name = "eno")
	private Estimate estimate;
	
	
	
}
