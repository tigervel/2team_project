import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  Box, Grid, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { getMyAllEstimateList } from '../../../api/estimateApi/estimateApi';

const MyInform = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [totalOrders, setTotalOrders] = useState(0); // 총 주문건수 state

  useEffect(() => {
    // 백엔드에서 목록 가져오기
    getMyAllEstimateList({ page: 1, size: 1000 }) // 페이지 크게 해서 전체 가져오기
      .then((data) => {
        setTotalOrders(data.length); // 목록 개수를 총 주문건수로
      })
      .catch((err) => {
        console.error("총 주문건수 불러오기 실패:", err);
      });
  }, []);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [{
          label: '수익',
          data: [300, 500, 400, 600, 700, 550],
          borderColor: 'rgba(124, 58, 237, 1)',
          borderWidth: 2,
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value} 만`,
            },
          },
        },
      }
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ flexGrow: 1 , px : 0}}>
        <Box sx={{ p: 4, bgcolor: '#f3f4f6' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            배송 정보 관리
          </Typography>

          {/* 상태 카드 */}
          <Grid container spacing={2} mb={4}>
            {[
              ['총 주문건수', `${totalOrders}건`], // 백엔드 데이터 반영
              ['배송 중', '2건'],
              ['배송 완료', '13건'],
              ['취소/중단', '0건'],
            ].map(([label, value], idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper sx={{ p: 2, width: 300, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h6" fontWeight="bold">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 그래프 & 문의 내역 */}
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>월별 수익률</Typography>
                <Box display="flex" width={648} alignItems="center" mb={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'purple', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption" color="purple">수익</Typography>
                </Box>
                <canvas ref={chartRef} height="150" />
              </Paper>
            </Grid>

            <Grid item xs={14} md={6}>
              <Paper sx={{ p: 2, width:648, height:390}}>
                <Typography variant="body2" color="text.secondary" align="center" mb={2}>내 문의 내역</Typography>
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">문의내용</TableCell>
                        <TableCell align="center">작성일</TableCell>
                        <TableCell align="center">답변여부</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        ['배송 지연 관련 문의', '2025-07-25', '답변 완료'],
                        ['결제 오류 문의', '2025-07-27', '미답변'],
                        ['운전자 위치 확인 요청', '2025-07-30', '답변 완료'],
                      ].map(([content, date, status], idx) => (
                        <TableRow key={idx}>
                          <TableCell align="center">{content}</TableCell>
                          <TableCell align="center">{date}</TableCell>
                          <TableCell align="center" sx={{ color: status === '답변 완료' ? 'green' : 'red' }}>
                            {status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MyInform;