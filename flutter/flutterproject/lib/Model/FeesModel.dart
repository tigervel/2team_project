class FeesModel {
  final int tno;
  final String weight;
  final double ratePerKm;
  final double baseCost;   // 앱에서는 initialCharge 대신 baseCost라고 이름 변경
  final String? imageUrl;
  final DateTime? updatedAt;

  FeesModel({
    required this.tno,
    required this.weight,
    required this.ratePerKm,
    required this.baseCost,
    this.imageUrl,
    this.updatedAt,
  });
}
