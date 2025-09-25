import 'package:dio/dio.dart';
import 'package:flutterproject/API/ApiConfig.dart';
import 'package:flutterproject/DTO/FeesDTO.dart';
import 'package:flutterproject/DTO/FeesExtraDTO.dart';
import 'package:flutterproject/Model/FeesExtraModel.dart';
import 'package:flutterproject/Model/FeesModel.dart';

class FeesApi {
  final Dio  _dio = Dio(BaseOptions(
    baseUrl: Apiconfig.baseUrl,
    headers: {"Content-Type": "application/json"},
  ));

  Future<List<FeesModel>> fetchFees() async {
    final response = await _dio.post("/g2i4/estimate/subpath/searchfeesbasic");
    final List<dynamic> data = response.data;
    return data.map((e) => FeesDTO.fromJson(e).toModel()).toList();
  }

  Future<List<FeesExtraModel>> fetchFeesExtra() async {
    final response = await _dio.post('/g2i4/estimate/subpath/searchfeesextra');
    final List<dynamic> data =response.data;
    return data.map((e) => FeesExtraDTO.fromJson(e).toModel()).toList();

  }
}
