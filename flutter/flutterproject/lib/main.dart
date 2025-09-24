import 'package:flutter/material.dart';
import 'package:flutterproject/Page/MainPageEx.dart';
import 'package:flutterproject/Screen/Simple_inquiry/SimpleInquiry.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {

 
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    home: Mainpageex(),
    routes: {
      '/estimate':(context) => Simpleinquiry(),
    },));
}

