import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Container,
} from '@mui/material';

const columns = [
  '화물명',
  '무게',
  '출발지',
  '도착지',
  '배송 시작일',
  '운전 기사',
  '배송 상태',
];

const progcolumns = [
  '화물명',
  '무게',
  '출발지',
  '도착지',
  '배송 시작일',
  '운전 기사',
  '승인 여부'
]

const emptyRow = {
  화물명: '-',
  출발지: '-',
  도착지: '-',
  '배송 시작일': '-',
  '예상 도착일': '-',
  '운전 기사': '-',
  '배송 상태': '-',
  '승인 여부' : '미승인'
};

const DeliveryInfoPage = () => {
  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          배송 정보 관리
        </Typography>

        {/* 현재 운반 중인 화물 */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            견적 의뢰 진행 상황
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  {progcolumns.map((col) => (
                    <TableCell key={col} align="center">
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {progcolumns.map((col) => (
                    <TableCell key={col} align="center">
                      {emptyRow[col]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 구분선 */}
        <Divider sx={{ my: 8 }} />
       

        {/* 현재 운반 중인 화물 */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            현재 운반 중인 화물
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {emptyRow[col]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 구분선 */}
        <Divider sx={{ my: 8 }} />

        {/* 배송 완료된 화물 */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            배송 완료된 화물
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {emptyRow[col]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveryInfoPage;