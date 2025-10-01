import 'package:jwt_decoder/jwt_decoder.dart';

List<String> getRolesFromToken(String token){
  final raw = token.startsWith('Bearer ')? token.substring(7) : token;
  final payload = JwtDecoder.decode(raw);
  final roles =payload['roles'];
  if(roles is List){
    return roles.map((e) => e.toString()).toList();
  }else if (roles is String) {
    return roles.split(RegExp(r'[,\s]+')).where((s) => s.isNotEmpty).toList();
  }
  return const [];
}