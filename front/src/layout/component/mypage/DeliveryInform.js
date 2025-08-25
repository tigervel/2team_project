import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Container, Button
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { getMyUnpaidEstimateList, getMyPaidEstimateList } from '../../../api/estimateApi/estimateApi';
import { useNavigate } from "react-router-dom";
import { simplifyBatch } from "../../../api/addressApi/addressApi";
//시작일 지나고 매칭 안 된 로그는 숨기기 역순 eno 높을수록 첫페이지
//시작일 지남+ 배송예정일 지남 -> 결제일 초과 시작일지남+미승인 -> 매칭취소
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
// 안전 파서: "YYYY-MM-DD HH:mm"도 처리
// 안전 파서: 다양한 포맷 지원 + 날짜만 있을 땐 '그날 23:59:59'로 간주
const parseDateSmart = (v) => {
  if (v == null) return null;

  // 숫자 타임스탬프
  if (typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof v === 'string') {
    const raw = v.trim();
    if (!raw) return null;

    // YYYY-MM-DD (하이픈)
    const ymdDash = /^(\d{4})-(\d{2})-(\d{2})$/;
    // YYYY.MM.DD (닷)
    const ymdDot = /^(\d{4})\.(\d{2})\.(\d{2})$/;
    // YYYY/MM/DD (슬래시)
    const ymdSlash = /^(\d{4})\/(\d{2})\/(\d{2})$/;

    let m;
    if ((m = raw.match(ymdDash)) || (m = raw.match(ymdDot)) || (m = raw.match(ymdSlash))) {
      // 로컬 타임존 기준으로 '해당일 23:59:59'
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1; // 0-based
      const day = parseInt(m[3], 10);
      const d = new Date(year, month, day, 23, 59, 59, 999);
      return isNaN(d.getTime()) ? null : d;
    }

    // 공백 → T 치환해서 ISO로 시도
    const isoLike = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
    const d = new Date(isoLike);
    return isNaN(d.getTime()) ? null : d;
  }

  // Date 객체 같은 케이스
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

// 배송예정일 후보 키들(실제 필드명에 맞게 추가/정정)
const DUE_KEYS = [
  'startTime',           // 추가: 출발일을 배송예정일로 사용
  'deliveryDueDate',
  'deliveryDate',
  'expectedDeliveryDate',
  'expectedEndDate',
  'deliveryEndTime',
  'endTime',
  'endDate',
  'dueDate',
  'paymentDueDate',
  'paymentDeadline'
];

// 객체에서 첫 번째로 값이 존재하는 키의 값을 반환
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
  const [paidData, setPaidData] = useState(initState);            // 결제됨
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });   // 미결제 페이지
  const [paidPage, setPaidPage] = useState({ page: 1, size: 5 });       // 결제됨 페이지

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };

  // 미결제 로딩
  useEffect(() => {
    getMyUnpaidEstimateList(pageParams)
      .then(async (data) => {
        console.table(data.slice(0, 3));
        // 배치 단순화 요청: [start, end, start, end, ...]
        // eno 내림차순 정렬 (숫자/문자 대비)
        const sorted = [...data].sort((a, b) => {
          const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
          const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
          return B - A; // desc
        });
        const addresses = [];
        for (const it of sorted) {
          addresses.push(it.startAddress || "");
          addresses.push(it.endAddress || "");
        }

        // 서버에서 일괄 변환
        const results = await simplifyBatch(addresses); // 배열 길이 동일

        // 결과를 다시 DTO에 주입
        const withShort = sorted.map((it, idx) => ({
          ...it,
          startAddressShort: results[idx * 2] ?? "",
          endAddressShort: results[idx * 2 + 1] ?? "",
        }));

        setServerData(paginate(withShort, pageParams));
      })
      .catch((err) => console.error("미결제 견적 로딩 실패:", err));
  }, [pageParams]);

  // 결제됨 로딩
  useEffect(() => {
    getMyPaidEstimateList(paidPage)
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
          const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
          return B - A;
        });
        setPaidData(paginate(sorted, paidPage));
      })
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

      // 1) 배송예정일(=startTime 등) '날짜가 지나갔고' + 승인됨 -> 결제일 초과
      if (due && isAfterDay(now, due) && isAccepted) {
        rightCell = <Typography sx={{ color: 'warning.main' }} variant="body2">결제일 초과</Typography>;
      }
      // 2) 시작일 '날짜가 지나갔고' + 미승인 -> 매칭취소
      else if (start && isAfterDay(now, start) && !isAccepted) {
        rightCell = <Typography color="error" variant="body2">매칭취소</Typography>;
      }
      // 3) 승인됨 -> 승인 확인 버튼
      else if (isAccepted) {
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
      }
      // 4) 기본: 미승인
      else {
        rightCell = <Typography color="error" variant="body2">미승인</Typography>;
      }

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddressShort ?? ""}</TableCell>
          <TableCell align="center">{item.endAddressShort ?? ""}</TableCell>
          <TableCell align="center">
            {item.startTime ? new Date(item.startTime.replace(' ', 'T')).toLocaleDateString() : '-'}
          </TableCell>
          <TableCell align="center">{item.cargoId ?? '-'}</TableCell>
          <TableCell align="center">{rightCell}</TableCell>
        </TableRow>
      );
    });
  };

  // 공통용 (결제/배송완료는 그대로 풀주소 표시)
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
              <TableBody>{renderUnpaidRows(serverData.dtoList)}</TableBody>
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