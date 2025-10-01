import 'package:shared_preferences/shared_preferences.dart';

const String kFallbackAccessToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6enoxMjM0NSIsImxvZ2luSWQiOiJ6enoxMjM0NSIsImVtYWlsIjoicGtuNDY5M0BuYXZlci5jb20iLCJyb2xlcyI6WyJST0xFX0RSSVZFUiIsIlJPTEVfVVNFUiJdLCJpc3MiOiJnaXByb2plY3QiLCJpYXQiOjE3NTkyMjE5MTksImV4cCI6MTc1OTIyMzcxOX0.SnLQXSGTDeTc0v3SBhNdB7qkdxHzeF0s1FqEDklZxeM';

Future<String> loadAccessToken() async {
  final prefs = await SharedPreferences.getInstance();
  final token =
      prefs.getString('token') ??
      prefs.getString('accessToken') ??
      prefs.getString('ACCESS_TOKEN') ??
      prefs.getString('access_token');
  if (token != null && token.isNotEmpty) {
    return token;
  }
  return kFallbackAccessToken;
}
