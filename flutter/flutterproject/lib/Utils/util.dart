import 'package:flutter/material.dart';
import 'package:flutterproject/provider/TokenProvider.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:provider/provider.dart';

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

Future<bool> ensureLoggedIn(BuildContext context) async {
  final tp = context.read<Tokenprovider>();
  final token = tp.gettoken;

  final notLoggedIn = token == null || token.isEmpty;
  final expired = token != null && JwtDecoder.isExpired(token);

  if (notLoggedIn || expired) {
    await tp.clearToken(); // Provider + SharedPreferences 비움
    if (!context.mounted) return false;
    Navigator.of(context).pushNamed('/login');
    return false;
  }
  return true;
}