package com.giproject.controller.kakaomap;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.giproject.dto.kakaomap.KakaoMapDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/map")
public class KakaoMapController {
	private final RestTemplate restTemplate = new RestTemplate();
	
	private final String kakaoApiKey = "KakaoAK d381d00137ba5677a3ee0355c4c95abf";
	
	@GetMapping("/directions")
	public ResponseEntity<KakaoMapDTO> getDirections(
			
			@RequestParam("startAddress") String startAddress,
	        @RequestParam("endAddress") String endAddress) throws Exception{

		// 1. 주소 → 좌표 변환 API 호출
		String coordUrl = "https://dapi.kakao.com/v2/local/search/address.json?query=";

		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", kakaoApiKey);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		// 출발지 좌표
		ResponseEntity<String> startRes = restTemplate.exchange(
		        coordUrl + startAddress, HttpMethod.GET, entity, String.class);
		JsonNode startJson = new ObjectMapper().readTree(startRes.getBody());
		double startX = startJson.path("documents").get(0).path("x").asDouble();
		double startY = startJson.path("documents").get(0).path("y").asDouble();

		// 도착지 좌표
		ResponseEntity<String> endRes = restTemplate.exchange(
		        coordUrl + endAddress, HttpMethod.GET, entity, String.class);
		JsonNode endJson = new ObjectMapper().readTree(endRes.getBody());
		double endX = endJson.path("documents").get(0).path("x").asDouble();
		double endY = endJson.path("documents").get(0).path("y").asDouble();

		// 2. Directions API 호출
		String url = "https://apis-navi.kakaomobility.com/v1/directions"
		        + "?origin=" + startX + "," + startY
		        + "&destination=" + endX + "," + endY;

		ResponseEntity<String> response =
		        restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

		// JSON 파싱 (기존 로직 그대로)
		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode root = objectMapper.readTree(response.getBody());
		JsonNode route = root.path("routes").get(0);
		JsonNode summary = route.path("summary");

		int distance = summary.path("distance").asInt();
		int duration = summary.path("duration").asInt();

		// 좌표 path 추출
		List<List<Double>> path = new ArrayList<>();
		for (JsonNode section : route.path("sections")) {
		    for (JsonNode road : section.path("roads")) {
		        ArrayNode vertexes = (ArrayNode) road.path("vertexes");
		        for (int i = 0; i < vertexes.size(); i += 2) {
		            double x = vertexes.get(i).asDouble();
		            double y = vertexes.get(i + 1).asDouble();
		            path.add(List.of(x, y));
		        }
		    }
		}

		// DTO 반환
		KakaoMapDTO dto = new KakaoMapDTO(distance, duration, path);
		return ResponseEntity.ok(dto);

		
	}
	
}
