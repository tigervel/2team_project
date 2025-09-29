import 'package:flutter/material.dart';
import 'package:flutterproject/Model/OrderSheetModel.dart';

class OrderDetailCard extends StatelessWidget {
  final OrderSheetModel order;
  final VoidCallback? onTapHeader; // "주문 상세 보기" 클릭 액션 (옵션)

  const OrderDetailCard({
    super.key,
    required this.order,
    this.onTapHeader,
  });

  @override
  Widget build(BuildContext context) {
    final blue = const Color(0xFFBFD7FF);
    final header = const Color(0xFFC5AFA7); // 스샷의 상단 바 색 톤 근사치

    return Container(
      margin: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: blue,
        border: Border.all(color: Colors.black87, width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ─ Header: 주문 상세 보기
          Material(
            color: header,
            child: InkWell(
              onTap: onTapHeader,
              child: const SizedBox(
                height: 40,
                width: double.infinity,
                child: Center(
                  child: Text(
                    '주문 상세 보기',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ),

          // ─ Body
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 왼쪽 빨간 점
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // 우측 내용
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _labelValue(
                        context,
                        label: '주문 번호 : ',
                        value: _v(order.orderUuid),
                        valueStyle: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                      ),
                      const SizedBox(height: 12),

                      const Text(
                        '배송지',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // 트럭 아이콘 + 주소들
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.local_shipping, size: 28, color: Colors.white70),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _v(order.startAddress),
                                  style: const TextStyle(height: 1.3),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('→  ', style: TextStyle(fontSize: 16)),
                                    Expanded(
                                      child: Text(
                                        _v(order.endAddress),
                                        style: const TextStyle(height: 1.3),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),
                      _labelValue(
                        context,
                        label: '배송 담당자 : ',
                        value: _v(order.cargoOwnerName),
                      ),
                      _labelValue(
                        context,
                        label: '연락처 : ',
                        value: _v(order.cargoOwnerPhone),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 라벨: 값 (값은 굵게)
  Widget _labelValue(BuildContext context,
      {required String label, required String value, TextStyle? valueStyle}) {
    final base = DefaultTextStyle.of(context).style;
    return RichText(
      text: TextSpan(
        style: base,
        children: [
          TextSpan(text: label),
          TextSpan(
            text: value,
            style: const TextStyle(fontWeight: FontWeight.w700).merge(valueStyle),
          ),
        ],
      ),
    );
  }

  // 빈값 방지
  String _v(String? s) => (s == null || s.trim().isEmpty) ? '—' : s;
}
