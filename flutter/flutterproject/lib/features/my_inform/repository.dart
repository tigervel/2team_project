import 'package:dio/dio.dart';
import 'models.dart';

class MyInformRepository {
  final Dio dio;
  MyInformRepository(this.dio);

  String _pickType(Map data) {
    String? pick(Map x) => (x['userType'] ?? x['type'] ?? x['role'] ?? x['loginType']) as String?;
    final t = pick(data) ?? pick((data['data'] ?? {}) as Map) ?? 'MEMBER';
    return (t == 'CARGO_OWNER') ? 'CARGO_OWNER' : 'MEMBER';
  }

  List<Map<String, dynamic>> _asList(dynamic d) {
    if (d is List) return d.cast<Map<String, dynamic>>();
    if (d is Map && d['dtoList'] is List) return (d['dtoList'] as List).cast<Map<String, dynamic>>();
    return [];
  }

  Future<String> fetchUserType() async {
    final res = await dio.get('/g2i4/user/info');
    return _pickType(res.data as Map);
  }

  Future<List<Map<String, dynamic>>> getMyAllEstimateList() async {
    final r = await dio.get('/g2i4/estimate/subpath/my-all-list');
    return _asList(r.data);
  }

  Future<List<Map<String, dynamic>>> getMyPaidEstimateList() async {
    final r = await dio.get('/g2i4/estimate/subpath/paidlist');
    return _asList(r.data);
  }

  Future<List<Map<String, dynamic>>> getOwnerPaidList() async {
    final r = await dio.get('/g2i4/owner/deliveries/paid');
    return _asList(r.data);
  }

  Future<List<Map<String, dynamic>>> getOwnerCompletedList() async {
    final r = await dio.get('/g2i4/owner/deliveries/completed');
    return _asList(r.data);
  }

  Future<List<MonthlyPoint>> getOwnerMonthlyRevenue() async {
    final r = await dio.get('/g2i4/owner/revenue/monthly');
    final list = (r.data as List?) ?? [];
    return list.map((e) => MonthlyPoint.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Inquiry>> getMyInquiries(int limit) async {
    final r = await dio.get('/g2i4/qna/my', queryParameters: {'limit': limit});
    final list = (r.data as List?) ?? [];
    return list.map((e) => Inquiry.fromJson(e as Map<String, dynamic>)).toList();
  }
}
