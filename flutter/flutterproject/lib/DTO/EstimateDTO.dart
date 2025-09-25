import 'package:flutterproject/Model/EstimateModel.dart';

/// 서버 JSON을 직렬/역직렬화하는 DTO
class EstimateDTO {
  final int? eno;

  final String? startAddress;
  final String? endAddress;
  final double? distanceKm;

  final String? cargoWeight;
  final String? cargoType;

  final DateTime? startTime;

  final int? totalCost;
  final bool? matched;
  final String? memberId;

  /// 서버에서 isTemp / temp 둘 다 올 수 있어 대비
  final bool? isTemp;

  /// 서버에서 @JsonProperty("isAccepted") → 키가 "isAccepted"로 내려옴
  final bool? accepted;

  final int? matchingNo;

  /// 서버에서 isOrdered / ordered 둘 다 올 수 있어 대비
  final bool? isOrdered;

  final int? baseCost;
  final int? distanceCost;
  final int? specialOption;

  final int? paymentNo;

  /// 서버 enum을 우선 String으로 안전 수신(필요시 enum으로 확장)
  final String? deliveryStatus;

  final String? driverName;
  final DateTime? deliveryCompletedAt;

  const EstimateDTO({
    this.eno,
    this.startAddress,
    this.endAddress,
    this.distanceKm,
    this.cargoWeight,
    this.cargoType,
    this.startTime,
    this.totalCost,
    this.matched,
    this.memberId,
    this.isTemp,
    this.accepted,
    this.matchingNo,
    this.isOrdered,
    this.baseCost,
    this.distanceCost,
    this.specialOption,
    this.paymentNo,
    this.deliveryStatus,
    this.driverName,
    this.deliveryCompletedAt,
  });

  factory EstimateDTO.fromJson(Map<String, dynamic> json) {
    int? asInt(dynamic v) {
      if (v == null) return null;
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse(v.toString().replaceAll(',', ''));
    }

    double? asDouble(dynamic v) {
      if (v == null) return null;
      if (v is double) return v;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString());
    }

    DateTime? asDateTime(dynamic v) {
      if (v == null) return null;
      if (v is DateTime) return v;
      if (v is int) {
        // epoch millis로 오는 경우 대비
        return DateTime.fromMillisecondsSinceEpoch(v).toLocal();
      }
      if (v is String) {
        final s = v.contains('T') ? v : v.replaceFirst(' ', 'T');
        try {
          // 오프셋 포함 시 자동 처리
          final dt = DateTime.parse(s);
          return dt.isUtc ? dt.toLocal() : dt;
        } catch (_) {
          return null;
        }
      }
      return null;
    }

    bool? asBool(dynamic v) {
      if (v == null) return null;
      if (v is bool) return v;
      final s = v.toString().toLowerCase();
      if (s == 'true' || s == '1') return true;
      if (s == 'false' || s == '0') return false;
      return null;
    }

    // isTemp / temp, isOrdered / ordered 등 다양한 키에 대비
    bool? pickBool(Map<String, dynamic> m, List<String> keys) {
      for (final k in keys) {
        if (m.containsKey(k)) return asBool(m[k]);
      }
      return null;
    }

    return EstimateDTO(
      eno: asInt(json['eno']),
      startAddress: json['startAddress']?.toString(),
      endAddress: json['endAddress']?.toString(),
      distanceKm: asDouble(json['distanceKm']),

      cargoWeight: json['cargoWeight']?.toString(),
      cargoType: json['cargoType']?.toString(),

      startTime: asDateTime(json['startTime']),

      totalCost: asInt(json['totalCost']),
      matched: asBool(json['matched']),
      memberId: json['memberId']?.toString(),
      isTemp: pickBool(json, const ['isTemp', 'temp']),
      accepted: asBool(json['isAccepted']), // 서버 @JsonProperty("isAccepted")
      matchingNo: asInt(json['matchingNo']),
      isOrdered: pickBool(json, const ['isOrdered', 'ordered']),

      baseCost: asInt(json['baseCost']),
      distanceCost: asInt(json['distanceCost']),
      specialOption: asInt(json['specialOption']),

      paymentNo: asInt(json['paymentNo']),
      deliveryStatus: json['deliveryStatus']?.toString(),
      driverName: json['driverName']?.toString(),
      deliveryCompletedAt: asDateTime(json['deliveryCompletedAt']),
    );
  }

  /// 서버로 보낼 때 키 네이밍을 서버 기대에 맞춰서 구성
  Map<String, dynamic> toJson() {
    String? iso(DateTime? dt) => dt == null
        ? null
        : dt.toIso8601String().split('.').first; // "YYYY-MM-DDTHH:mm:ss"

    return {
      'eno': eno,
      'startAddress': startAddress,
      'endAddress': endAddress,
      'distanceKm': distanceKm,
      'cargoWeight': cargoWeight,
      'cargoType': cargoType,
      'startTime': iso(startTime),
      'totalCost': totalCost,
      'matched': matched,
      'memberId': memberId,
      // accepted는 백엔드가 isAccepted로 받도록 지정되어 있음
      'isAccepted': accepted,
      // isTemp / isOrdered는 서버와 맞춰서 isXxx로 보냄 (필요시 키명 조정)
      'isTemp': isTemp,
      'matchingNo': matchingNo,
      'isOrdered': isOrdered,
      'baseCost': baseCost,
      'distanceCost': distanceCost,
      'specialOption': specialOption,
      'paymentNo': paymentNo,
      'deliveryStatus': deliveryStatus,
      'driverName': driverName,
      'deliveryCompletedAt': iso(deliveryCompletedAt),
    };
  }

  /// 앱 내부에서 쓰기 편한 Model로 변환
  EstimateModel toModel() => EstimateModel(
        eno: eno,
        startAddress: startAddress ?? '',
        endAddress: endAddress ?? '',
        distanceKm: distanceKm ?? 0.0,
        cargoWeight: cargoWeight ?? '',
        cargoType: cargoType ?? '',
        startTime: startTime,
        totalCost: totalCost ?? 0,
        matched: matched ?? false,
        memberId: memberId,
        isTemp: isTemp ?? false,
        accepted: accepted ?? false,
        matchingNo: matchingNo,
        isOrdered: isOrdered ?? false,
        baseCost: baseCost ?? 0,
        distanceCost: distanceCost ?? 0,
        specialOption: specialOption ?? 0,
        paymentNo: paymentNo,
        deliveryStatus: deliveryStatus,
        driverName: driverName,
        deliveryCompletedAt: deliveryCompletedAt,
      );

  EstimateDTO copyWith({
    int? eno,
    String? startAddress,
    String? endAddress,
    double? distanceKm,
    String? cargoWeight,
    String? cargoType,
    DateTime? startTime,
    int? totalCost,
    bool? matched,
    String? memberId,
    bool? isTemp,
    bool? accepted,
    int? matchingNo,
    bool? isOrdered,
    int? baseCost,
    int? distanceCost,
    int? specialOption,
    int? paymentNo,
    String? deliveryStatus,
    String? driverName,
    DateTime? deliveryCompletedAt,
  }) {
    return EstimateDTO(
      eno: eno ?? this.eno,
      startAddress: startAddress ?? this.startAddress,
      endAddress: endAddress ?? this.endAddress,
      distanceKm: distanceKm ?? this.distanceKm,
      cargoWeight: cargoWeight ?? this.cargoWeight,
      cargoType: cargoType ?? this.cargoType,
      startTime: startTime ?? this.startTime,
      totalCost: totalCost ?? this.totalCost,
      matched: matched ?? this.matched,
      memberId: memberId ?? this.memberId,
      isTemp: isTemp ?? this.isTemp,
      accepted: accepted ?? this.accepted,
      matchingNo: matchingNo ?? this.matchingNo,
      isOrdered: isOrdered ?? this.isOrdered,
      baseCost: baseCost ?? this.baseCost,
      distanceCost: distanceCost ?? this.distanceCost,
      specialOption: specialOption ?? this.specialOption,
      paymentNo: paymentNo ?? this.paymentNo,
      deliveryStatus: deliveryStatus ?? this.deliveryStatus,
      driverName: driverName ?? this.driverName,
      deliveryCompletedAt: deliveryCompletedAt ?? this.deliveryCompletedAt,
    );
  }
}

/// 앱 내부에서 편하게 쓰는 모델 (UI 바인딩 등)
