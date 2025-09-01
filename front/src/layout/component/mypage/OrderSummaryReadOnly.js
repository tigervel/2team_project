import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Grid, Typography, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";
import { postOrderPome } from "../../../api/orderAPI/orderApi";

// ===== 시안 맞춤 고정 폭 =====
const LABEL_WIDTH = 120;
const NAME_WIDTH = 110;

const serverInitState = {
  ordererName: "",
  ordererPhone: "",
  ordererEmail: "",
  startAddress: "",
  endAddress: "",
  baseCost: "",
  distanceCost: "",
  specialOptionCost: "",
  totalCost: "",
  matchingNo: "",
};

// ===== 유틸 =====
const splitPhone = (raw) => {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return ["", "", ""];
  if (d.startsWith("02") && (d.length === 9 || d.length === 10)) {
    return d.length === 9
      ? [d.slice(0, 2), d.slice(2, 5), d.slice(5)]
      : [d.slice(0, 2), d.slice(2, 6), d.slice(6)];
  }
  if (d.length === 11) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
  if (d.length === 10) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  return [d.slice(0, 3), d.slice(3, d.length - 4), d.slice(-4)];
};

const joinPhone = (raw) => {
  const [a, b, c] = splitPhone(raw);
  return [a, b, c].filter(Boolean).join("-") || "";
};

const splitEmail = (raw) => {
  if (!raw || !raw.includes("@")) return ["", ""];
  const [local, domain] = raw.split("@");
  return [local ?? "", domain ?? ""];
};

const toCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("ko-KR");
};

// ===== 한 줄 표시 컴포넌트 (라벨/값) =====
const FieldRow = ({ label, children, dense = false }) => (
  <Grid
    container
    alignItems="center"
    wrap="nowrap"
    sx={{
      py: dense ? 0.75 : 1.25,
      borderBottom: "1px dashed #e0e0e0",
    }}
  >
    <Grid item sx={{ width: LABEL_WIDTH, pr: 2 }}>
      <Typography sx={{ fontWeight: 600, textAlign: "right" }}>{label} :</Typography>
    </Grid>
    <Grid item sx={{ flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          minHeight: 28,
          fontFamily:
            "'Pretendard', 'Inter', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          color: "#222",
          wordBreak: "break-all",
        }}
      >
        {children}
      </Box>
    </Grid>
  </Grid>
);

const SectionTitle = ({ children }) => (
  <Box sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
      {children}
    </Typography>
  </Box>
);

const OrderSummaryReadOnly = () => {
  const { state } = useLocation();
  const matchingNo = state?.matchingNo;
  // { addressee, phone, addresseeEmail, startRestAddress, endRestAddress }
  const passedOrderSheet = state?.orderSheet;

  const [serverData, setServerData] = useState(serverInitState);

  useEffect(() => {
    if (!matchingNo) return;
    postOrderPome(matchingNo)
      .then((data) => setServerData(data))
      .catch(console.error);
  }, [matchingNo]);

  // ===== 주문자(출발지) 데이터 가공 =====
  const ordererPhone = useMemo(
    () => joinPhone(serverData.ordererPhone),
    [serverData.ordererPhone]
  );
  const [ordererEmailLocal, ordererEmailDomain] = useMemo(
    () => splitEmail(serverData.ordererEmail),
    [serverData.ordererEmail]
  );

  // ===== 받는분(도착지) 데이터 가공 =====
  const receiverPhone = useMemo(
    () => joinPhone(passedOrderSheet?.phone),
    [passedOrderSheet?.phone]
  );
  const [receiverEmailLocal, receiverEmailDomain] = useMemo(
    () => splitEmail(passedOrderSheet?.addresseeEmail),
    [passedOrderSheet?.addresseeEmail]
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
        주문서 요약 (읽기 전용)
      </Typography>

      {/* ===== 출발지(주문자) 정보 ===== */}
      <SectionTitle>출발지 정보</SectionTitle>
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 3,
          maxWidth: 800,
          mx: "auto",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #eee" }}>
          <Typography sx={{ fontWeight: 700 }}>주문자</Typography>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <FieldRow label="주문자">
            <Typography sx={{ width: NAME_WIDTH }}>{serverData.ordererName || ""}</Typography>
          </FieldRow>
          <FieldRow label="물품 출발 주소">
            <Typography>{serverData.startAddress || ""}</Typography>
          </FieldRow>
          <FieldRow label="상세 주소">
            <Typography>{passedOrderSheet?.startRestAddress || ""}</Typography>
          </FieldRow>
          <FieldRow label="휴대전화" dense>
            <Typography>{ordererPhone}</Typography>
          </FieldRow>
          <FieldRow label="이메일" dense>
            <Typography sx={{ mr: 1 }}>{ordererEmailLocal}</Typography>
            <Typography sx={{ mx: 0.5 }}>@</Typography>
            <Typography>{ordererEmailDomain}</Typography>
          </FieldRow>
        </Box>
      </Paper>

      {/* ===== 도착지(받는분) 정보 ===== */}
      <SectionTitle>도착지 정보</SectionTitle>
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 3,
          maxWidth: 800,
          mx: "auto",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #eee" }}>
          <Typography sx={{ fontWeight: 700 }}>받는분</Typography>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <FieldRow label="받는분">
            <Typography sx={{ width: NAME_WIDTH }}>
              {passedOrderSheet?.addressee || ""}
            </Typography>
          </FieldRow>
          <FieldRow label="물품 도착 주소">
            <Typography>{serverData.endAddress || ""}</Typography>
          </FieldRow>
          <FieldRow label="상세 주소">
            <Typography>{passedOrderSheet?.endRestAddress || ""}</Typography>
          </FieldRow>
          <FieldRow label="휴대전화" dense>
            <Typography>{receiverPhone}</Typography>
          </FieldRow>
          <FieldRow label="이메일" dense>
            <Typography sx={{ mr: 1 }}>{receiverEmailLocal}</Typography>
            <Typography sx={{ mx: 0.5 }}>@</Typography>
            <Typography>{receiverEmailDomain}</Typography>
          </FieldRow>
        </Box>
      </Paper>

      {/* ===== 결제/요금 요약 ===== */}
      <SectionTitle>결제 요약</SectionTitle>
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 3,
          maxWidth: 800,
          mx: "auto",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #eee" }}>
          <Typography sx={{ fontWeight: 700 }}>요금 내역</Typography>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <FieldRow label="기본요금">
            <Typography>{toCurrency(serverData.baseCost)} 원</Typography>
          </FieldRow>
          <FieldRow label="거리요금">
            <Typography>{toCurrency(serverData.distanceCost)} 원</Typography>
          </FieldRow>
          <FieldRow label="옵션요금">
            <Typography>{toCurrency(serverData.specialOptionCost)} 원</Typography>
          </FieldRow>

          <Divider sx={{ my: 2 }} />

          <Grid
            container
            alignItems="center"
            wrap="nowrap"
            sx={{ py: 1.5 }}
          >
            <Grid item sx={{ width: LABEL_WIDTH, pr: 2 }}>
              <Typography sx={{ fontWeight: 800, textAlign: "right" }}>
                총 결제금액 :
              </Typography>
            </Grid>
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  minHeight: 32,
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#111",
                }}
              >
                {toCurrency(serverData.totalCost)} 원
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderSummaryReadOnly;
