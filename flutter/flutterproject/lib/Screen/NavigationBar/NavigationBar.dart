import 'package:flutter/material.dart';

class Navigationbar extends StatelessWidget{
  const Navigationbar({super.key});

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text('로그인'),
        
      ),
    );

  }
}