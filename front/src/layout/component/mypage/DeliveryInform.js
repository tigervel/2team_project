// DeliveryInfoPage.jsx (replace all)
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Container, Button
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { useNavigate } from "react-router-dom";
import { getMyUnpaidEstimateList, getMyPaidEstimateList } from '../../../api/estimateApi/estimateApi';
import { simplifyBatch } from "../../../api/addressApi/addressApi";
import axios from 'axios';

// ===== 공통 API 베이스/인스턴스 =====
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// 맨 위에 axios 인스턴스는 그대로 두고, 타입 파서만 추가
const parseUserType = (raw) => {
  // EditMyInform처럼 방어적으로
  const t = raw?.userType || raw?.type || raw?.role || raw?.loginType || null;
  if (t === 'MEMBER' || t === 'CARGO_OWNER') return t;
  // 혹시 payload 안에 들어있는 경우
  const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
  const guess =
    data?.userType || data?.type || data?.role || data?.loginType || null;
  return (guess === 'MEMBER' || guess === 'CARGO_OWNER') ? guess : null;
};


// ===== 기존 회원용 API (그대로 사용하되 import 대신 여기서 호출도 가능) =====
const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.dtoList)) return data.dtoList;
  return [];
};

// ===== 차주용 API (백엔드에 맞춰 endpoint만 수정해서 쓰면 됨) =====
// 진행중/대기(결제됨) 목록
const getOwnerPaidList = async ({ page, size }) => {
  const { data } = await api.get('/g2i4/owner/deliveries/paid', { params: { page, size } });
  return data ?? [];
};
// 완료 목록
const getOwnerCompletedList = async ({ page, size }) => {
  const { data } = await api.get('/g2i4/owner/deliveries/completed', { params: { page, size } });
  return data ?? [];
};
// 배송 완료 처리
const completeDelivery = async (matchingNo) => {
  // POST가 아니고 PUT/PATCH면 바꿔줘
  const { data } = await api.post(`/g2i4/owner/deliveries/${matchingNo}/complete`);
  return data;
};



// ===== 유틸 =====
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
        hour12: false,
      })
    : '-';
};

const statusKo = (s) =>
  s === 'IN_TRANSIT' ? '배송 중'
    : s === 'COMPLETED' ? '배송 완료'
      : '대기';

// ===== 메인 컴포넌트 =====
const DeliveryInfoPage = () => {
  const navigate = useNavigate();

  // 로그인 사용자 타입
  const [userType, setUserType] = useState(null); // 'MEMBER' | 'CARGO_OWNER'
  const isMember = userType === 'MEMBER';
  const isOwner = userType === 'CARGO_OWNER';

  // 회원용 상태
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });

  const [paidData, setPaidData] = useState(initState);
  const [paidPage, setPaidPage] = useState({ page: 1, size: 5 });

  const [completedData, setCompletedData] = useState(initState);
  const [completedPage, setCompletedPage] = useState({ page: 1, size: 5 });

  // 차주용 상태 (진행/완료는 위의 paidData/completedData를 재활용)
  // => unpaid 섹션은 숨김

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };

  // 초기: 사용자 타입 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/g2i4/user/info');
       const t = parseUserType(data);
       if (!cancelled) setUserType(t || 'MEMBER'); // 안전망
      } catch (e) {
        console.error('사용자 타입 조회 실패', e);
        if (!cancelled) setUserType('MEMBER'); // 안전망: 기본 회원 처리
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ======== 회원(MEMBER): 미결제 로딩 ========
  useEffect(() => {
  if (userType !== 'MEMBER') return;
  getMyUnpaidEstimateList(pageParams)
    .then(async (raw) => {
      const base = asList(raw);

      const sorted = [...base].sort((a, b) => {
        const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
        const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
        return B - A;
      });

      // 주소 축약
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
}, [userType, pageParams]);

  useEffect(() => {
  if (userType !== 'MEMBER') return;

  (async () => {
    try {
      const raw = await getMyPaidEstimateList(paidPage);
      const base = asList(raw);

      const sorted = [...base].sort((a, b) => {
        const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
        const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
        return B - A;
      });

      const completed = sorted.filter((it) => it.deliveryStatus === 'COMPLETED');
      const inProgressOrWaiting = sorted.filter((it) => it.deliveryStatus !== 'COMPLETED');

      setPaidData(paginate(inProgressOrWaiting, paidPage));
      setCompletedData(paginate(completed, completedPage));
    } catch (err) {
      console.error("결제된 견적 로딩 실패:", err);
    }
  })();
}, [userType, paidPage, completedPage]);

  // ======== 페이지 이동 핸들러 ========
  const movePage = (pageObj) => setPageParams((prev) => ({ ...prev, ...pageObj }));
  const movePaidPage = (pageObj) => setPaidPage((prev) => ({ ...prev, ...pageObj }));
  const moveCompletedPage = (pageObj) => setCompletedPage((prev) => ({ ...prev, ...pageObj }));

  // ======== 테이블 공통 ========
  const tableColgroup = useMemo(() => (
    <colgroup>
      <col style={{ width: '10%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '26%' }} />
      <col style={{ width: '26%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '8%' }} />
      <col style={{ width: '8%' }} />
    </colgroup>
  ), []);

  // ======== 렌더러 (회원: 미결제) ========
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

  // ======== 렌더러 (결제됨: 회원/차주 공용) ========
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

      // 차주 전용: IN_TRANSIT면 "배송 완료 처리" 버튼 노출
      const ownerAction = isOwner && s === 'IN_TRANSIT' ? (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={async () => {
            try {
              await completeDelivery(item.matchingNo ?? item.mno ?? item.matching_no);
              // UX: 목록 갱신
              setPaidPage((p) => ({ ...p }));      // 트리거
              setCompletedPage((p) => ({ ...p })); // 트리거
            } catch (e) {
              alert('완료 처리에 실패했습니다.');
              console.error(e);
            }
          }}
        >
          배송 완료 처리
        </Button>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: s === 'IN_TRANSIT' ? 'info.main' : 'text.secondary' }}
        >
          {statusKo(s)}
        </Typography>
      );

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
            {isOwner ? ownerAction : (
              <Typography
                variant="body2"
                sx={{ color: s === 'IN_TRANSIT' ? 'info.main' : 'text.secondary' }}
              >
                {statusKo(s)}
              </Typography>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  // ======== 렌더러 (완료 공용) ========
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

  // ======== 렌더 ========
  if (!userType) return <Box sx={{ p: 6 }}>사용자 타입 확인 중…</Box>;

  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          {isMember ? '배송 정보 관리' : '차주 배송 관리'}
        </Typography>

        {/* 회원 전용: 미결제 */}
        {isMember && (
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
        )}

        {/* 결제됨 (대기/배송 중) */}
        <Divider sx={{ my: 8 }} />
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {isMember ? '견적 의뢰 진행 상황 (결제됨)' : '진행 중 배송 (결제됨)'}
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
                  <TableCell align="center">{isOwner ? '처리' : '상태'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderPaidRows(paidData.dtoList)}</TableBody>
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={paidData} movePage={movePaidPage} />
            </Box>
          </TableContainer>
        </Box>

        {/* 완료 */}
        <Divider sx={{ my: 8 }} />
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {isMember ? '배송 완료 된 화물' : '완료된 배송'}
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
                  <TableCell align="center">{isMember ? '배송 완료일' : '완료일'}</TableCell>
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
