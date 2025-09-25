import 'package:flutter/material.dart';
import 'package:flutterproject/API/OrderSheetApi.dart';
import 'package:flutterproject/Model/OrderSheetModel.dart';
import 'package:flutterproject/Screen/OrderDetailCard/OrderDetailCard.dart';


// 🔢 테스트용 매칭번호 여기서 바꾸세요
const int kHardcodedMatchingNo = 66;

class OrderDetailHardcodedView extends StatefulWidget {
  const OrderDetailHardcodedView({super.key});

  @override
  State<OrderDetailHardcodedView> createState() => _OrderDetailHardcodedViewState();
}

class _OrderDetailHardcodedViewState extends State<OrderDetailHardcodedView> {
  final _api = OrderSheetApi();
  late Future<OrderSheetModel?> _future;

  @override
  void initState() {
    super.initState();
    _future = _api.fetchOrderByMatchingNo(kHardcodedMatchingNo);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<OrderSheetModel?>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError) {
          return Center(child: Text('오류: ${snap.error}'));
        }
        final order = snap.data;
        if (order == null) {
          return const Center(child: Text('주문을 찾을 수 없습니다.'));
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            OrderDetailCard(
              order: order,          // 🔴 빨간점/트럭 아이콘 있는 카드 UI 그대로 사용
              onTapHeader: () {},    // 필요하면 탭 시 이동 로직 넣기
            ),
          ],
        );
      },
    );
  }
}
