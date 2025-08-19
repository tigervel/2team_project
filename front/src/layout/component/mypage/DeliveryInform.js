import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Container, Button
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { getMyUnpaidEstimateList, getMyPaidEstimateList } from '../../../api/estimateApi/estimateApi'; // ★ 추가
import { useNavigate } from "react-router-dom";

const initState = {
  dtoList: [], pageNumList: [],
  prev: false, next: false, totalCount: 0,
  prevPage: 0, nextPage: 0, totalPage: 0, current: 1,
};

// 공통 페이지네이션 유틸
const paginate = (data, { page, size }) => {
  const totalCount = data.length;
  const totalPage = Math.ceil(totalCount / size);
  const current = page;
  const startIdx = (current - 1) * size;
  const endIdx = startIdx + size;
  const pageData = data.slice(startIdx, endIdx);

  const startPage = Math.max(1, current - 2);
  const endPage = Math.min(totalPage, startPage + 4);
  const pageNumList = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return {
    dtoList: pageData, pageNumList,
    prev: current > 1, next: current < totalPage,
    totalCount, totalPage,
    prevPage: current > 1 ? current - 1 : 1,
    nextPage: current < totalPage ? current + 1 : totalPage,
    current,
  };
};

const DeliveryInfoPage = () => {
  const navigate = useNavigate();

  // 미결제(기존 serverData) + 결제(새 paidData) 상태 분리
  const [serverData, setServerData] = useState(initState);        // 미결제
  const [paidData, setPaidData] = useState(initState);            // ★ 결제됨
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });   // 미결제 페이지
  const [paidPage, setPaidPage] = useState({ page: 1, size: 5 });       // ★ 결제됨 페이지

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };

  // 미결제 로딩
  useEffect(() => {
    getMyUnpaidEstimateList(pageParams)
      .then((data) => setServerData(paginate(data, pageParams)))
      .catch((err) => console.error("미결제 견적 로딩 실패:", err));
  }, [pageParams]);

  // 결제됨 로딩
  useEffect(() => {
    getMyPaidEstimateList(paidPage)
      .then((data) => setPaidData(paginate(data, paidPage)))
      .catch((err) => console.error("결제된 견적 로딩 실패:", err));
  }, [paidPage]);

  const movePage = (pageObj) => setPageParams((prev) => ({ ...prev, ...pageObj }));
  const movePaidPage = (pageObj) => setPaidPage((prev) => ({ ...prev, ...pageObj }));  // ★

  const tableColgroup = (
    <colgroup>
      <col style={{ width: '10%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '26%' }} />
      <col style={{ width: '26%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '8%' }} />
      <col style={{ width: '8%' }} />
    </colgroup>
  );

  const renderTableRows = (list) =>
    (!list || list.length === 0) ? (
      <TableRow>
        <TableCell colSpan={7} align="center">항목이 없습니다.</TableCell>
      </TableRow>
    ) : (
      list.map((item) => (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center">
            {item.startTime ? new Date(item.startTime.replace(' ', 'T')).toLocaleDateString() : '-'}
          </TableCell>
          <TableCell align="center">{item.cargoId ?? '-'}</TableCell>
          <TableCell align="center">
            {item.isAccepted ? (
              <Button variant="contained" color="success" size="small"
                onClick={() => handleConfirmClick(item.matchingNo)}>
                승인 확인
              </Button>
            ) : (
              <Typography color="error" variant="body2">미승인</Typography>
            )}
          </TableCell>
        </TableRow>
      ))
    );

  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          배송 정보 관리
        </Typography>

        {/* 1) 미결제 */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            견적 의뢰 진행 상황 (미결제)
          </Typography>
          <TableContainer component={Paper} elevation={1} sx={{ height: 470, position: 'relative', pb: 0 }}>
            <Table sx={{ '& .MuiTableCell-root': { height: 60, py: 0 } }}>
              {tableColgroup}
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">무게</TableCell>
                  <TableCell align="center">출발지</TableCell>
                  <TableCell align="center">도착지</TableCell>
                  <TableCell align="center">배송 시작일</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  <TableCell align="center">승인 여부</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderTableRows(serverData.dtoList)}</TableBody>
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>

        {/* 결제됨 */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            견적 의뢰 진행 상황 (결제됨)
          </Typography>
          <TableContainer component={Paper} elevation={1} sx={{ height: 470, position: 'relative', pb: 0 }}>
            <Table sx={{ '& .MuiTableCell-root': { height: 60, py: 0 } }}>
              {tableColgroup}
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">무게</TableCell>
                  <TableCell align="center">출발지</TableCell>
                  <TableCell align="center">도착지</TableCell>
                  <TableCell align="center">배송 시작일</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  <TableCell align="center">승인 여부</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderTableRows(paidData.dtoList)}</TableBody> 
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={paidData} movePage={movePaidPage} />  
            </Box>
          </TableContainer>
        </Box>

        {/* 3. 배송 완료 된 화물 */}
        <Divider sx={{ my: 8 }} />
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            배송 완료 된 화물
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">무게</TableCell>
                  <TableCell align="center">출발지</TableCell>
                  <TableCell align="center">도착지</TableCell>
                  <TableCell align="center">배송 시작일</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  <TableCell align="center">승인 여부</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderTableRows()}</TableBody>
            </Table>
            <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5  }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveryInfoPage;