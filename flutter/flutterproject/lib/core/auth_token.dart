import 'package:shared_preferences/shared_preferences.dart';

const String kFallbackAccessToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6enoxMjM0NSIsImxvZ2luSWQiOiJ6enoxMjM0NSIsImVtYWlsIjoicGtuNDY5M0BuYXZlci5jb20iLCJyb2xlcyI6WyJST0xFX0RSSVZFUiIsIlJPTEVfVVNFUiJdLCJpc3MiOiJnaXByb2plY3QiLCJpYXQiOjE3NTkxMjc3NDQsImV4cCI6MTc1OTEyOTU0NH0.nZjrPYJGWaTv965sKs9h2osfoGfGbPioe7cqhxoeKHw';

Future<String> loadAccessToken() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('accessToken') ??
      prefs.getString('ACCESS_TOKEN') ??
      prefs.getString('access_token');
  if (token != null && token.isNotEmpty) {
    return token;
  }
  return kFallbackAccessToken;
}