// lib/DTO/matching_dto.dart
class MatchingDTO {
  final int matchNo;
  final int? eno;
  final String? cargoId;
  final bool isAccepted;
  final String? acceptedTime; // 문자열 그대로 받기 (필요시 DateTime로 파싱)

  final String route;       // "출발지 - 도착지" 통짜 문자열
  final String distanceKm;  // "70.7" 같은 문자열
  final String cargoWeight; // "0.5톤" 등
  final String startTime;   // "2025-12-10 10:00" 등
  final String cargoType;   // "약품" 등
  final String totalCost;   // "276700" 또는 "276,700" 등 문자열

  MatchingDTO({
    required this.matchNo,
    required this.eno,
    required this.cargoId,
    required this.isAccepted,
    this.acceptedTime,
    required this.route,
    required this.distanceKm,
    required this.cargoWeight,
    required this.startTime,
    required this.cargoType,
    required this.totalCost,
  });

  factory MatchingDTO.fromJson(Map<String, dynamic> json) {
    return MatchingDTO(
      matchNo: int.tryParse('${json['matchNo']}') ?? 0,
      eno: json['eno'] == null ? null : int.tryParse('${json['eno']}'),
      cargoId: json['cargoId']?.toString(),
      // 백엔드 @JsonProperty("isAccepted") 를 그대로 받음
      isAccepted: json['isAccepted'] == true || '${json['isAccepted']}' == 'true',
      acceptedTime: json['acceptedTime']?.toString(),
      route: '${json['route'] ?? ''}',
      distanceKm: '${json['distanceKm'] ?? ''}',
      cargoWeight: '${json['cargoWeight'] ?? ''}',
      startTime: '${json['startTime'] ?? ''}',
      cargoType: '${json['cargoType'] ?? ''}',
      totalCost: '${json['totalCost'] ?? ''}',
    );
  }
}
