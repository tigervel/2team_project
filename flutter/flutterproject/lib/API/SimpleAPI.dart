import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/DTO/FeesDTO.dart';
import 'package:flutterproject/Model/FeesModel.dart';

class SimpleAPI {
  final Dio  _dio = Dio(BaseOptions(
    baseUrl: Apiconfig.baseUrl,
    headers: {"Content-Type": "application/json"},
  ));

  Future<List<FeesModel>> fetchFees() async {
    final response = await _dio.post("/g2i4/estimate/subpath/searchfeesbasic");
    final List<dynamic> data = response.data;
    return data.map((e) => FeesDTO.fromJson(e).toModel()).toList();
  }
}
