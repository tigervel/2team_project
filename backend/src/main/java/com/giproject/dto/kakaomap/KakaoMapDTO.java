package com.giproject.dto.kakaomap;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KakaoMapDTO {
	private int distance;//총 거리
	private int duration;//예상 소요 시간 (sec);
	private List<List<Double>> path; //경로 좌표

}
