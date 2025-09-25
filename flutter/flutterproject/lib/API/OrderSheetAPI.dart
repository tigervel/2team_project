import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/DTO/OrderSheetDTO.dart';
import 'package:flutterproject/Model/OrderSheetModel.dart';

class OrderSheetApi {
  final Dio _dio;

  OrderSheetApi()
      : _dio = Dio(BaseOptions(
          // PostMapping("/")에 맞추기 위해 Controller의 기본 경로를 baseUrl에 포함해야 할 수 있습니다.
          // 예: http://10.0.2.2:8080/api/orders
          baseUrl: Apiconfig.baseUrl, 
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ));

  /// matchingNo로 내 주문 내역 불러오기 (POST 방식)
  Future<OrderSheetModel?> fetchOrderByMatchingNo(int matchingNo) async {
    try {
      // 서버 컨트롤러에서 요구하는 JSON 형식: {"mcNo": 12345}
      final requestData = {'mcNo': matchingNo};

      // POST 요청으로 변경하고, 'data' 파라미터에 요청 본문을 전달합니다.
      // 실제 엔드포인트가 "/"이므로 dio.post("/")가 되어야 합니다. 
      // 여기서는 전체 경로를 가정하여 작성합니다.
      final response = await _dio.post("/g2i4/subpath/order/", data: requestData);

      if (response.statusCode == 200 && response.data != null) {
        final dto = OrderSheetDTO.fromJson(response.data);
        return dto.toModel();
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        debugPrint("주문을 찾을 수 없습니다: $matchingNo");
      } else {
        debugPrint("주문 조회 실패: $e");
      }
      return null;
    } catch (e) {
      debugPrint("알 수 없는 오류: $e");
      return null;
    }
  }
}
