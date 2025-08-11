import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, Container, Button
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { getMyAllEstimateList } from '../../../api/estimateApi/estimateApi';
import { useNavigate } from "react-router-dom";


const initState = {
  dtoList: [],
  pageNumList: [],
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0, 
  current: 1,
};

const DeliveryInfoPage = () => {
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });
  const navigate = useNavigate();

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };


useEffect(() => {
  getMyAllEstimateList(pageParams)
    .then((data) => {
      const totalCount = data.length;
      const totalPage = Math.ceil(totalCount / pageParams.size);
      const current = pageParams.page;
      const startIdx = (current - 1) * pageParams.size;
      const endIdx = startIdx + pageParams.size;
      const pageData = data.slice(startIdx, endIdx);

      // 페이지 번호 최대 5개 제한
      const startPage = Math.max(1, current - 2);
      const endPage = Math.min(totalPage, startPage + 4);
      const pageNumList = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      setServerData({
        dtoList: pageData,
        pageNumList,
        prev: current > 1,
        next: current < totalPage,
        totalCount,
        totalPage,
        prevPage: current > 1 ? current - 1 : 1,
        nextPage: current < totalPage ? current + 1 : totalPage,
        current,
      });
    })
    .catch((err) => {
      console.error("견적 목록 로딩 실패:", err);
    });
}, [pageParams]);

  const movePage = (pageObj) => {
    setPageParams((prev) => ({
      ...prev,
      ...pageObj,
    }));
  };

  const renderTableRows = () =>
    serverData.dtoList.length === 0 ? (
      <TableRow>
        <TableCell colSpan={7} align="center">
          진행 중인 견적이 없습니다.
        </TableCell>
      </TableRow>
    ) : (
      serverData.dtoList.map((item) => (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}kg</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center">
            {new Date(item.startTime).toLocaleDateString()}
          </TableCell>
          <TableCell align="center">{item.cargoId}</TableCell>
          <TableCell align="center">
            {item.isAccepted ? (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleConfirmClick(item.matchingNo)}
              >
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
      <Container maxWidth="md">
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          배송 정보 관리
        </Typography>

        {/* 1. 견적 의뢰 진행 상황 */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            견적 의뢰 진행 상황
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
            <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>

        {/* 2. 현재 운반 중인 화물 */}
        <Divider sx={{ my: 8 }} />
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            현재 운반 중인 화물
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
            <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
              <PageComponent serverData={serverData} movePage={movePage} />
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
            <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveryInfoPage;