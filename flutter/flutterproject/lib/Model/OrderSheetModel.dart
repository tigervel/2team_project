class OrderSheetModel {
  final String? ordererName;
  final String? ordererPhone;
  final String? ordererEmail;

  final String? startAddress;

  final String? addressee;
  final String? addresseeEmail;
  final String? receiverPhone;
  final String? endAddress;
  final String? startRestAddress;
  final String? endRestAddress;

  final int? baseCost;
  final int? distanceCost;
  final int? specialOptionCost;
  final int? totalCost;

  final String? orderUuid;
  final String? orderTime;

  final int? matchingNo;

  final String? cargoOwnerName;
  final String? cargoOwnerPhone;

  OrderSheetModel({
    required this.ordererName,
    required this.ordererPhone,
    required this.ordererEmail,
    required this.startAddress,
    required this.addressee,
    required this.addresseeEmail,
    required this.receiverPhone,
    required this.endAddress,

    required this.startRestAddress,
    required this.endRestAddress,

    required this.baseCost,
    required this.distanceCost,
    required this.specialOptionCost,
    required this.totalCost,

    required this.orderUuid,
    required this.orderTime,

    required this.matchingNo,

    required this.cargoOwnerName,
    required this.cargoOwnerPhone,
  });
}
