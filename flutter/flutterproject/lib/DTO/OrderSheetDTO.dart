import 'package:flutterproject/Model/OrderSheetModel.dart';

class OrderSheetDTO {
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

  OrderSheetDTO({
    this.ordererName,
    this.ordererPhone,
    this.ordererEmail,
    this.startAddress,
    this.addressee,
    this.addresseeEmail,
    this.receiverPhone,
    this.endAddress,
    this.startRestAddress,
    this.endRestAddress,
    this.baseCost,
    this.distanceCost,
    this.specialOptionCost,
    this.totalCost,
    this.orderUuid,
    this.orderTime,
    this.matchingNo,
    this.cargoOwnerName,
    this.cargoOwnerPhone,
  });

  // JSON -> DTO
  factory OrderSheetDTO.fromJson(Map<String, dynamic> json) {
    return OrderSheetDTO(
      ordererName: json['ordererName'],
      ordererPhone: json['ordererPhone'],
      ordererEmail: json['ordererEmail'],
      startAddress: json['startAddress'],
      addressee: json['addressee'],
      addresseeEmail: json['addresseeEmail'],
      receiverPhone: json['receiverPhone'],
      endAddress: json['endAddress'],
      startRestAddress: json['startRestAddress'],
      endRestAddress: json['endRestAddress'],
      baseCost: json['baseCost'],
      distanceCost: json['distanceCost'],
      specialOptionCost: json['specialOptionCost'],
      totalCost: json['totalCost'],
      orderUuid: json['orderUuid'],
      orderTime: json['orderTime'],
      matchingNo: json['matchingNo'],
      cargoOwnerName: json['cargoOwnerName'],
      cargoOwnerPhone: json['cargoOwnerPhone'],
    );
  }

  // DTO -> JSON
  Map<String, dynamic> toJson() {
    return {
      'ordererName': ordererName,
      'ordererPhone': ordererPhone,
      'ordererEmail': ordererEmail,
      'startAddress': startAddress,
      'addressee': addressee,
      'addresseeEmail': addresseeEmail,
      'receiverPhone': receiverPhone,
      'endAddress': endAddress,
      'startRestAddress': startRestAddress,
      'endRestAddress': endRestAddress,
      'baseCost': baseCost,
      'distanceCost': distanceCost,
      'specialOptionCost': specialOptionCost,
      'totalCost': totalCost,
      'orderUuid': orderUuid,
      'orderTime': orderTime,
      'matchingNo': matchingNo,
      'cargoOwnerName': cargoOwnerName,
      'cargoOwnerPhone': cargoOwnerPhone,
    };
  }

  // DTO -> Model
  OrderSheetModel toModel() {
    return OrderSheetModel(
      ordererName: ordererName,
      ordererPhone: ordererPhone,
      ordererEmail: ordererEmail,
      startAddress: startAddress,
      addressee: addressee,
      addresseeEmail: addresseeEmail,
      receiverPhone: receiverPhone,
      endAddress: endAddress,
      startRestAddress: startRestAddress,
      endRestAddress: endRestAddress,
      baseCost: baseCost,
      distanceCost: distanceCost,
      specialOptionCost: specialOptionCost,
      totalCost: totalCost,
      orderUuid: orderUuid,
      orderTime: orderTime,
      matchingNo: matchingNo,
      cargoOwnerName: cargoOwnerName,
      cargoOwnerPhone: cargoOwnerPhone,
    );
  }
}