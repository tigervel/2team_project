import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Container, Button
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { getMyUnpaidEstimateList, getMyPaidEstimateList } from '../../../api/estimateApi/estimateApi';
import { useNavigate } from "react-router-dom";
import { simplifyBatch } from "../../../api/addressApi/addressApi";

// 날짜/페이지/불리언 처리 
const initState = {
  dtoList: [], pageNumList: [],
  prev: false, next: false, totalCount: 0,
  prevPage: 0, nextPage: 0, totalPage: 0, current: 1,
};

const isAfterDay = (a, b) => {
  if (!a || !b) return false;
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return A.getTime() > B.getTime();
};

const parseDateSmart = (v) => {
  if (v == null) return null;

  if (typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'string') {
    const raw = v.trim();
    if (!raw) return null;

    const ymdDash = /^(\d{4})-(\d{2})-(\d{2})$/;
    const ymdDot = /^(\d{4})\.(\d{2})\.(\d{2})$/;
    const ymdSlash = /^(\d{4})\/(\d{2})\/(\d{2})$/;

    let m;
    if ((m = raw.match(ymdDash)) || (m = raw.match(ymdDot)) || (m = raw.match(ymdSlash))) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const day = parseInt(m[3], 10);
      const d = new Date(year, month, day, 23, 59, 59, 999);
      return isNaN(d.getTime()) ? null : d;
    }

    const isoLike = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
    const d = new Date(isoLike);
    return isNaN(d.getTime()) ? null : d;
  }
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const DUE_KEYS = [
  'startTime', 'deliveryDueDate', 'deliveryDate', 'expectedDeliveryDate',
  'expectedEndDate', 'deliveryEndTime', 'endTime', 'endDate',
  'dueDate', 'paymentDueDate', 'paymentDeadline'
];

const pickFirst = (obj, keys) => {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== '') return obj[k];
  }
  return null;
};

const normalizeBoolean = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'y' || s === 'yes' || s === 'true' || s === '1';
};

const paginate = (data, { page, size }) => {
  const totalCount = data.length;
  const totalPage = Math.ceil(totalCount / size || 1);
  const current = Math.min(Math.max(1, page), totalPage);
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
const formatDateHour = (v) => {
  const d = parseDateSmart(v);
  return d
    ? d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,     // 24시간제 (13시 형태)
      })
    : '-';
};
const statusKo = (s) =>
  s === 'IN_TRANSIT' ? '배송 중'
    : s === 'COMPLETED' ? '배송 완료'
      : '대기';

// 페이지
const DeliveryInfoPage = () => {
  const navigate = useNavigate();

  // 미결제
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });

  // 결제됨(진행/대기만)
  const [paidData, setPaidData] = useState(initState);
  const [paidPage, setPaidPage] = useState({ page: 1, size: 5 });

  // 완료
  const [completedData, setCompletedData] = useState(initState);
  const [completedPage, setCompletedPage] = useState({ page: 1, size: 5 });

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };

  // 미결제 로딩
  useEffect(() => {
    getMyUnpaidEstimateList(pageParams)
      .then(async (data) => {
        // eno 내림차순
        const sorted = [...data].sort((a, b) => {
          const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
          const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
          return B - A;
        });

        // 주소 축약 서버 호출: [start, end, start, end, ...]
        const addresses = [];
        for (const it of sorted) {
          addresses.push(it.startAddress || "");
          addresses.push(it.endAddress || "");
        }
        const results = await simplifyBatch(addresses);

        const withShort = sorted.map((it, idx) => ({
          ...it,
          startAddressShort: results[idx * 2] ?? "",
          endAddressShort: results[idx * 2 + 1] ?? "",
        }));

        setServerData(paginate(withShort, pageParams));
      })
      .catch((err) => console.error("미결제 견적 로딩 실패:", err));
  }, [pageParams]);

  // 결제됨 + 완료 로딩/분리
  useEffect(() => {
    getMyPaidEstimateList(paidPage)
      .then((data) => {
        // eno 내림차순
        const sorted = [...data].sort((a, b) => {
          const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
          const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
          return B - A;
        });

        // 완료/진행 분리
        const completed = sorted.filter((it) => it.deliveryStatus === 'COMPLETED');
        const inProgressOrWaiting = sorted.filter((it) => it.deliveryStatus !== 'COMPLETED'); // null 포함

        setPaidData(paginate(inProgressOrWaiting, paidPage));
        setCompletedData(paginate(completed, completedPage));
      })
      .catch((err) => console.error("결제된 견적 로딩 실패:", err));
  }, [paidPage, completedPage]);

  const movePage = (pageObj) => setPageParams((prev) => ({ ...prev, ...pageObj }));
  const movePaidPage = (pageObj) => setPaidPage((prev) => ({ ...prev, ...pageObj }));
  const moveCompletedPage = (pageObj) => setCompletedPage((prev) => ({ ...prev, ...pageObj }));

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

  // 미결제 행 렌더러
  const renderUnpaidRows = (list) => {
    const now = new Date();

    if (!list || list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">항목이 없습니다.</TableCell>
        </TableRow>
      );
    }

    return list.map((item) => {
      const start = parseDateSmart(item.startTime);
      const due = parseDateSmart(pickFirst(item, DUE_KEYS));
      const isAccepted = normalizeBoolean(item.isAccepted);

      let rightCell = null;

      if (due && isAfterDay(now, due) && isAccepted) {
        rightCell = <Typography sx={{ color: 'warning.main' }} variant="body2">결제일 초과</Typography>;
      } else if (start && isAfterDay(now, start) && !isAccepted) {
        rightCell = <Typography color="error" variant="body2">매칭취소</Typography>;
      } else if (isAccepted) {
        rightCell = (
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleConfirmClick(item.matchingNo)}
          >
            승인 확인
          </Button>
        );
      } else {
        rightCell = <Typography color="error" variant="body2">미승인</Typography>;
      }

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddressShort ?? ""}</TableCell>
          <TableCell align="center">{item.endAddressShort ?? ""}</TableCell>
          <TableCell align="center">
            <span style={{whiteSpace:'nowrap'}}>{formatDateHour(item.startTime)}</span>
          </TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>

          <TableCell align="center">{rightCell}</TableCell>
        </TableRow>
      );
    });
  };

  // 결제됨(진행/대기) 렌더러
  const renderPaidRows = (list) => {
    if (!list || list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">항목이 없습니다.</TableCell>
        </TableRow>
      );
    }

    return list.map((item) => {
      const s = item.deliveryStatus ?? null;
      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center">
           <span style={{whiteSpace:'nowrap'}}>{formatDateHour(item.startTime)}</span>
          </TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>

          <TableCell align="center">
            <Typography
              variant="body2"
              sx={{ color: s === 'IN_TRANSIT' ? 'info.main' : 'text.secondary' }}
            >
              {statusKo(s)}
            </Typography>
          </TableCell>
        </TableRow>
      );
    });
  };

  // 완료 렌더러
  // 보조: 공통 포맷터
  const formatDate = (v) => {
    const d = parseDateSmart(v);
    return d ? d.toLocaleDateString() : '-';
  };

  // 완료 렌더러
  const renderCompletedRows = (list) => {
    if (!list || list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">항목이 없습니다.</TableCell>
        </TableRow>
      );
    }

    return list.map((item) => {
      const doneAt = item.deliveryCompletedAt ?? item.endTime ?? null;

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{formatDateHour(doneAt)}</TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>
          <TableCell align="center">
            <Typography variant="body2" sx={{ color: 'success.main' }}>배송 완료</Typography>
          </TableCell>
        </TableRow>
      );
    });
  };

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
              <TableBody>{renderUnpaidRows(serverData.dtoList)}</TableBody>
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>

        {/* 2) 결제됨 (대기/배송 중) */}
        
        <Divider sx={{ my: 8 }} />
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
                  <TableCell align="center">상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderPaidRows(paidData.dtoList)}</TableBody>
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={paidData} movePage={movePaidPage} />
            </Box>
          </TableContainer>
        </Box>

        {/* 3) 배송 완료 */}
        <Divider sx={{ my: 8 }} />
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            배송 완료 된 화물
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table sx={{ '& .MuiTableCell-root': { height: 60, py: 0 } }}>
              {tableColgroup}
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">무게</TableCell>
                  <TableCell align="center">출발지</TableCell>
                  <TableCell align="center">도착지</TableCell>
                  <TableCell align="center">배송 완료일</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  <TableCell align="center">상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderCompletedRows(completedData.dtoList)}</TableBody>
            </Table>
            <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
              <PageComponent serverData={completedData} movePage={moveCompletedPage} />
            </Box>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveryInfoPage;