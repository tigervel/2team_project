// DeliveryInfoPage.jsx (full)
// 완료된 배송: 신고버튼 추가 (deliveryNo 전달)
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Container, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
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

// ===== 유저 타입 파서 =====
const parseUserType = (raw) => {
  const t = raw?.userType || raw?.type || raw?.role || raw?.loginType || null;
  if (t === 'MEMBER' || t === 'CARGO_OWNER') return t;
  const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
  const guess = data?.userType || data?.type || data?.role || data?.loginType || null;
  return (guess === 'MEMBER' || guess === 'CARGO_OWNER') ? guess : null;
};

// ===== 리스트 형태 통일 =====
const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.dtoList)) return data.dtoList;
  return [];
};

// ===== 차주용 API =====
const getOwnerUnpaidList = async ({ page, size }) => {
  const { data } = await api.get('/g2i4/owner/deliveries/unpaid', { params: { page, size } });
  return data ?? [];
};
const getOwnerPaidList = async ({ page, size }) => {
  const { data } = await api.get('/g2i4/owner/deliveries/paid', { params: { page, size } });
  return data ?? [];
};
const getOwnerCompletedList = async ({ page, size }) => {
  const { data } = await api.get('/g2i4/owner/deliveries/completed', { params: { page, size } });
  return data ?? [];
};
const startDelivery = async (matchingNo) => {
  try {
    const { data } = await api.post(`/g2i4/owner/deliveries/${matchingNo}/in_transit`);
    return data;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404 || status === 405) {
      const { data } = await api.post(`/g2i4/owner/deliveries/${matchingNo}/start`);
      return data;
    }
    throw e;
  }
};
const completeDelivery = async (matchingNo) => {
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
  } catch { return null; }
};
const DUE_KEYS = [
  'startTime', 'deliveryDueDate', 'deliveryDate', 'expectedDeliveryDate',
  'expectedEndDate', 'deliveryEndTime', 'endTime', 'endDate',
  'dueDate', 'paymentDueDate', 'paymentDeadline'
];
const pickFirst = (obj, keys) => {
  for (const k of keys) if (obj && obj[k] != null && obj[k] !== '') return obj[k];
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
  return { dtoList: pageData, pageNumList, prev: current > 1, next: current < totalPage, totalCount, totalPage, prevPage: current > 1 ? current - 1 : 1, nextPage: current < totalPage ? current + 1 : totalPage, current };
};
const formatDateHour = (v) => {
  const d = parseDateSmart(v);
  return d
    ? d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
    : '-';
};
const statusKo = (s) => s === 'IN_TRANSIT' ? '배송 중' : s === 'COMPLETED' ? '배송 완료' : '대기';

// ===== 메인 컴포넌트 =====
const DeliveryInfoPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // 'MEMBER' | 'CARGO_OWNER'
  const isMember = userType === 'MEMBER';
  const isOwner = userType === 'CARGO_OWNER';

  // 공용 상태
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });
  const [paidData, setPaidData] = useState(initState);
  const [paidPage, setPaidPage] = useState({ page: 1, size: 5 });
  const [completedData, setCompletedData] = useState(initState);
  const [completedPage, setCompletedPage] = useState({ page: 1, size: 5 });

  // 완료 모달
  const [openCompleteModal, setOpenCompleteModal] = useState(false);
  const [selectedMatchingNo, setSelectedMatchingNo] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  // 배송 시작 모달
  const [openStartModal, setOpenStartModal] = useState(false);
  const [selectedStartMatchingNo, setSelectedStartMatchingNo] = useState(null);

  // 신고 페이지 이동 (완료된 배송에서 사용)
  const goReportPage = (matchingNo, item) => {
    if (!matchingNo) {
      alert('이 건은 matchingNo가 없어 신고 페이지로 이동할 수 없습니다.');
      return;
    }
    navigate('/reportpage', {
      state: {
        matchingNo,
        estimateNo: item?.eno ?? null,
      },
    });
  };

  const handleConfirmClick = (matchingNo) => {
    navigate("/order", { state: { matchingNo } });
  };

  // ===== 완료 모달 제어 =====
  const handleOpenCompleteModal = (matchingNo) => {
    setSelectedMatchingNo(matchingNo);
    setConfirmText("");
    setOpenCompleteModal(true);
  };
  const handleCloseCompleteModal = () => {
    setOpenCompleteModal(false);
    setSelectedMatchingNo(null);
    setConfirmText("");
  };
  const handleConfirmComplete = async () => {
    if (confirmText !== "배송완료") return;
    try {
      await completeDelivery(selectedMatchingNo);
      setPaidPage((p) => ({ ...p }));      // 새로고침 트리거
      setCompletedPage((p) => ({ ...p })); // 새로고침 트리거
      handleCloseCompleteModal();
    } catch (e) {
      alert('완료 처리에 실패했습니다.');
    }
  };

  // ===== 배송 시작 모달 제어 =====
  const handleOpenStartModal = (matchingNo) => {
    setSelectedStartMatchingNo(matchingNo);
    setOpenStartModal(true);
  };
  const handleCloseStartModal = () => {
    setOpenStartModal(false);
    setSelectedStartMatchingNo(null);
  };
  const handleConfirmStart = async () => {
    try {
      await startDelivery(selectedStartMatchingNo);
      setPaidPage((p) => ({ ...p })); // 갱신
      handleCloseStartModal();
    } catch (e) {
      alert('배송 시작 처리에 실패했습니다.');
    }
  };

  // 사용자 타입 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/g2i4/user/info');
        const t = parseUserType(data);
        if (!cancelled) setUserType(t || 'MEMBER');
      } catch {
        if (!cancelled) setUserType('MEMBER');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 미결제(회원/차주 공용)
  useEffect(() => {
    if (!userType) return;
    (async () => {
      try {
        const raw = userType === 'MEMBER'
          ? await getMyUnpaidEstimateList(pageParams)
          : await getOwnerUnpaidList(pageParams);

        const base = asList(raw);
        const sorted = [...base].sort((a, b) => {
          const A = typeof a.eno === "string" ? parseInt(a.eno, 10) : a.eno ?? 0;
          const B = typeof b.eno === "string" ? parseInt(b.eno, 10) : b.eno ?? 0;
          return B - A;
        });

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
      } catch (err) {
        console.error("미결제 목록 로딩 실패:", err);
        setServerData(paginate([], pageParams));
      }
    })();
  }, [userType, pageParams]);

  // 결제됨/완료(회원/차주 분기)
  useEffect(() => {
    if (!userType) return;
    (async () => {
      try {
        if (userType === 'MEMBER') {
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
        } else {
          // CARGO_OWNER
          const paid = asList(await getOwnerPaidList(paidPage));
          const completed = asList(await getOwnerCompletedList(completedPage));

          setPaidData(paginate(paid, paidPage));
          setCompletedData(paginate(completed, completedPage));
        }
      } catch (err) {
        console.error("결제/완료 로딩 실패:", err);
        setPaidData(paginate([], paidPage));
        setCompletedData(paginate([], completedPage));
      }
    })();
  }, [userType, paidPage, completedPage]);

  // 페이지 이동 핸들러
  const movePage = (pageObj) => setPageParams((prev) => ({ ...prev, ...pageObj }));
  const movePaidPage = (pageObj) => setPaidPage((prev) => ({ ...prev, ...pageObj }));
  const moveCompletedPage = (pageObj) => setCompletedPage((prev) => ({ ...prev, ...pageObj }));

  // 공용 colgroup (미결제/결제됨)
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

  // 완료 전용 colgroup: 차주면 신고 컬럼 추가(8칸), 회원은 7칸
  const completedColgroup = useMemo(() => (
    <colgroup>
      <col style={{ width: '10%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '24%' }} />
      <col style={{ width: '24%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '10%' }} /> {/* 운전 기사 */}
      {isOwner && <col style={{ width: '8%' }} />} {/* 신고 */}
      <col style={{ width: '8%' }} />  {/* 상태 */}
    </colgroup>
  ), [isOwner]);

  // 렌더러: 미결제
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

      if (isOwner) {
        if (due && isAfterDay(now, due)) {
          rightCell = <Typography sx={{ color: 'warning.main' }} variant="body2">결제 기한 경과</Typography>;
        } else {
          rightCell = <Typography variant="body2" sx={{ color: 'text.secondary' }}>결제 대기</Typography>;
        }
      } else {
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
      }

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddressShort ?? ""}</TableCell>
          <TableCell align="center">{item.endAddressShort ?? ""}</TableCell>
          <TableCell align="center">
            <span style={{ whiteSpace: 'nowrap' }}>{formatDateHour(item.startTime)}</span>
          </TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>
          <TableCell align="center">{rightCell}</TableCell>
        </TableRow>
      );
    });
  };

  // 렌더러: 결제됨 (원래대로 운전 기사 / 처리|상태)
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

      let ownerAction = (
        <Typography variant="body2" sx={{ color: s === 'IN_TRANSIT' ? 'info.main' : 'text.secondary' }}>
          {statusKo(s)}
        </Typography>
      );

      if (isOwner) {
        if (s === 'PENDING' || !s) {
          ownerAction = (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handleOpenStartModal(item.matchingNo ?? item.mno ?? item.matching_no)}
            >
              배송 시작
            </Button>
          );
        } else if (s === 'IN_TRANSIT') {
          ownerAction = (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleOpenCompleteModal(item.matchingNo ?? item.mno ?? item.matching_no)}
            >
              배송 완료 처리
            </Button>
          );
        }
      }

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center">
            <span style={{ whiteSpace: 'nowrap' }}>{formatDateHour(item.startTime)}</span>
          </TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>
          <TableCell align="center">
            {isOwner ? ownerAction : (
              <Typography variant="body2" sx={{ color: s === 'IN_TRANSIT' ? 'info.main' : 'text.secondary' }}>
                {statusKo(s)}
              </Typography>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  // 렌더러: 완료 (여기에 신고 버튼 추가)
  const renderCompletedRows = (list) => {
    if (!list || list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={isOwner ? 8 : 7} align="center">항목이 없습니다.</TableCell>
        </TableRow>
      );
    }
    return list.map((item) => {
      const doneAt = item.deliveryCompletedAt ?? item.endTime ?? null;

      // 🔑 matchingNo만 안전 추출
      const matchingNo = item?.matchingNo ?? item?.mno ?? item?.matching_no ?? null;

      return (
        <TableRow key={item.eno}>
          <TableCell align="center">{item.cargoType}</TableCell>
          <TableCell align="center">{item.cargoWeight}</TableCell>
          <TableCell align="center">{item.startAddress}</TableCell>
          <TableCell align="center">{item.endAddress}</TableCell>
          <TableCell align="center" style={{ whiteSpace: 'nowrap' }}>{formatDateHour(doneAt)}</TableCell>
          <TableCell align="center">{item.driverName ?? '-'}</TableCell>

          {isOwner && (
            <TableCell align="center">
              {matchingNo ? (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    console.log("신고 버튼 클릭 - matchingNo:", matchingNo);
                    goReportPage(matchingNo, item);
                  }}
                >
                  신고
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">-</Typography>
              )}
            </TableCell>
          )}

          <TableCell align="center">
            <Typography variant="body2" sx={{ color: 'success.main' }}>배송 완료</Typography>
          </TableCell>
        </TableRow>
      );
    });
  };

  if (!userType) return <Box sx={{ p: 6 }}>사용자 타입 확인 중…</Box>;

  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          {isMember ? '배송 정보 관리' : '차주 배송 관리'}
        </Typography>

        {/* 미결제 (두 타입 모두 노출) */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {isMember ? '견적 의뢰 진행 상황 (미결제)' : '미결제 배송 요청'}
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
                  <TableCell align="center">{isOwner ? '상태' : '승인 여부'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderUnpaidRows(serverData.dtoList)}</TableBody>
            </Table>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 1.5, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>

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
              {completedColgroup}
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">무게</TableCell>
                  <TableCell align="center">출발지</TableCell>
                  <TableCell align="center">도착지</TableCell>
                  <TableCell align="center">{isMember ? '배송 완료일' : '완료일'}</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  {isOwner && <TableCell align="center">신고</TableCell>}
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

      {/* 배송 완료 확인 모달 */}
      <Dialog open={openCompleteModal} onClose={handleCloseCompleteModal}>
        <DialogTitle>배송 완료 처리</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            정말 완료 처리 하시겠습니까? <br />
            확인을 위해 아래 입력란에 <b>배송완료</b>라고 입력해주세요.
          </Typography>
          <TextField
            fullWidth
            margin="dense"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="배송완료"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteModal}>취소</Button>
          <Button
            onClick={handleConfirmComplete}
            color="success"
            variant="contained"
            disabled={confirmText !== "배송완료"}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 배송 시작 확인 모달 */}
      <Dialog open={openStartModal} onClose={handleCloseStartModal}>
        <DialogTitle>배송 시작</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            해당 건을 <b>배송 중</b>으로 변경합니다. 진행하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartModal}>취소</Button>
          <Button onClick={handleConfirmStart} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryInfoPage;
