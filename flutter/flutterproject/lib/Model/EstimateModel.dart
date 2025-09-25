class EstimateModel {
  final int? eno;

  final String startAddress;
  final String endAddress;
  final double distanceKm;

  final String cargoWeight;
  final String cargoType;

  final DateTime? startTime;

  final int totalCost;
  final bool matched;
  final String? memberId;

  final bool isTemp;
  final bool accepted;
  final int? matchingNo;
  final bool isOrdered;

  final int baseCost;
  final int distanceCost;
  final int specialOption;

  final int? paymentNo;

  /// 서버 enum 문자열 그대로 보관 (원하면 enum으로 변경 가능)
  final String? deliveryStatus;

  final String? driverName;
  final DateTime? deliveryCompletedAt;

  const EstimateModel({
    required this.eno,
    required this.startAddress,
    required this.endAddress,
    required this.distanceKm,
    required this.cargoWeight,
    required this.cargoType,
    required this.startTime,
    required this.totalCost,
    required this.matched,
    required this.memberId,
    required this.isTemp,
    required this.accepted,
    required this.matchingNo,
    required this.isOrdered,
    required this.baseCost,
    required this.distanceCost,
    required this.specialOption,
    required this.paymentNo,
    required this.deliveryStatus,
    required this.driverName,
    required this.deliveryCompletedAt,
  });
}
