import 'package:flutterproject/Model/FeesModel.dart';

class FeesDTO {
  final int tno;
  final String weight;
  final double ratePerKm;     
  final double initialCharge; 
  final DateTime? updatedAt;  
  final String? cargoImage;

  FeesDTO({
    required this.tno,
    required this.weight,
    required this.ratePerKm,
    required this.initialCharge,
    this.updatedAt,
    this.cargoImage,
  });

  factory FeesDTO.fromJson(Map<String, dynamic> json) {
    return FeesDTO(
      tno: json['tno'] as int,
      weight: json['weight'] as String,
      ratePerKm: (json['ratePerKm'] as num).toDouble(),
      initialCharge: (json['initialCharge'] as num).toDouble(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String) 
          : null,
      cargoImage: json['cargoImage'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tno': tno,
      'weight': weight,
      'ratePerKm': ratePerKm,
      'initialCharge': initialCharge,
      'updatedAt': updatedAt?.toIso8601String(),
      'cargoImage': cargoImage,
    };
  }

  /// DTO → Model 변환
  FeesModel toModel() {
    return FeesModel(
      tno: tno,
      weight: weight,
      ratePerKm: ratePerKm,
      baseCost: initialCharge,
      imageUrl: cargoImage,
      updatedAt: updatedAt,
    );
  }
}
