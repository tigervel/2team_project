import 'package:flutterproject/Model/FeesExtraModel.dart';

class FeesExtraDTO {
  final int exno;
  final String extraChargeTitle;
  final int extraCharge;
  final DateTime? updatedAt;

  FeesExtraDTO({
    required this.exno,
    required this.extraChargeTitle,
    required this.extraCharge,
    required this.updatedAt
  });

  factory FeesExtraDTO.fromJson(Map<String, dynamic> json) {
    return FeesExtraDTO(
      exno: json['exno'] as int,
      extraChargeTitle: json['extraChargeTitle'] as String,
      extraCharge: (json['extraCharge'] as num).toInt(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson(){
    return{
      'exno':exno,
      'extraChargeTitle':extraChargeTitle,
      'extraCharge':extraCharge,
      'updatedAt':updatedAt

    };
  }

  FeesExtraModel toModel(){
    return FeesExtraModel(
      exno: exno, 
      extraChargeTitle: extraChargeTitle,
       extraCharge: extraCharge, 
       updatedAt: updatedAt);
  
  }
}