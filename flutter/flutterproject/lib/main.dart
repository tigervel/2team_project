import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {

  WidgetsFlutterBinding.ensureInitialized();
  runApp(MaterialApp(home: HemoScreen(),));
}

class HemoScreen extends StatelessWidget{

  //const : 컴파일 시점에 자원을 할당하도록 하는 상수 키워드
  //final : 실행시점에 자원을 할당 하도록 하는 상수 키워드

  //컨트롤러를 생성하도록 한다.
  late final WebViewController _webViewController;

  HemoScreen({super.key}){
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)//자바스크립트 활성화
      ..loadRequest(Uri.parse('http://10.0.2.2:3000'));
  
  }
  
  //WebView 를 사용하려면 반드시 해당 컨트롤러가 있어야한다..(문법)
  //이 컨트롤러를 통해서 웹에 요청을 보내는 방식을 취한다
  //또한 이 컨트롤러를 통해서 웹에서 구현된 자바 스크립트를 사용할지를 결정해줘야 한다
  //또한 이때 사용되는 문법을 케스케이딩 문법을 사용할것이다(객체 메서드 메서드 형태이다)
  //또한, 컨트롤러는 반드시 이 위젯들이 로딩이 된 이후에 호출이 되어야한 해서
  //초기화 메서드를 호출할 것 이다 
  @override
  Widget build(BuildContext context) {
    return Scaffold(body: WebViewWidget(controller: _webViewController));
}

}