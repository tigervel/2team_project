import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Grid, Typography, TextField, Divider
} from "@mui/material";
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
  matchingNo: ""
};

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

const LabelBox = ({ text }) => (
  <Box sx={{ width: LABEL_WIDTH, pr: 2, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
    <Typography sx={{ fontWeight: 600 }}>{text} :</Typography>
  </Box>
);

const ReadOnly = (props) => (
  <TextField
    size="small"
    {...props}
    InputProps={{ readOnly: true }}
  />
);

const OrderSummaryReadOnly = () => {
  const { state } = useLocation();
  const matchingNo = state?.matchingNo;
  const passedOrderSheet = state?.orderSheet; // { addressee, phone, addresseeEmail, startRestAddress, endRestAddress }

  const [serverData, setServerData] = useState(serverInitState);

  useEffect(() => {
    if (!matchingNo) return;
    postOrderPome(matchingNo)
      .then((data) => setServerData(data))
      .catch(console.error);
  }, [matchingNo]);

  const [p1, p2, p3] = useMemo(() => splitPhone(serverData.ordererPhone), [serverData.ordererPhone]);
  const [rp1, rp2, rp3] = useMemo(() => splitPhone(passedOrderSheet?.phone), [passedOrderSheet?.phone]);

  const ordererEmailLocal = useMemo(() => serverData.ordererEmail?.split("@")[0] ?? "", [serverData.ordererEmail]);
  const ordererEmailDomain = useMemo(() => serverData.ordererEmail?.split("@")[1] ?? "", [serverData.ordererEmail]);

  const addresseeEmailLocal = useMemo(() => (passedOrderSheet?.addresseeEmail ?? "").split("@")[0] ?? "", [passedOrderSheet?.addresseeEmail]);
  const addresseeEmailDomain = useMemo(() => (passedOrderSheet?.addresseeEmail ?? "").split("@")[1] ?? "", [passedOrderSheet?.addresseeEmail]);

  return (
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
        주문서 (읽기 전용)
      </Typography>

      {/* ===== 출발지(주문자) 정보 ===== */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          출발지 정보
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        {/* 주문자 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="주문자" /></Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <ReadOnly sx={{ width: NAME_WIDTH }} value={serverData.ordererName} />
          </Grid>
        </Grid>

        {/* 물품 출발 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="물품 출발 주소" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.startAddress} />
          </Grid>
        </Grid>

        {/* 상세 주소(주문자 측 입력) */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="상세 주소" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={passedOrderSheet?.startRestAddress ?? ""} />
          </Grid>
        </Grid>

        {/* 휴대전화 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="휴대전화" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <ReadOnly sx={{ width: "15%" }} value={p1} />
            <Typography variant="h6">-</Typography>
            <ReadOnly sx={{ width: "20%" }} value={p2} />
            <Typography variant="h6">-</Typography>
            <ReadOnly sx={{ width: "20%" }} value={p3} />
          </Grid>
        </Grid>

        {/* 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="이메일" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <ReadOnly sx={{ flex: 1, maxWidth: 150 }} value={ordererEmailLocal} />
            <Typography variant="h6">@</Typography>
            <ReadOnly sx={{ flex: 1, maxWidth: 300 }} value={ordererEmailDomain} />
          </Grid>
        </Grid>
      </Paper>

      {/* ===== 도착지(받는분) 정보 ===== */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          도착지 정보
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        {/* 받는분 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="받는분" /></Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <ReadOnly sx={{ width: NAME_WIDTH }} value={passedOrderSheet?.addressee ?? ""} />
          </Grid>
        </Grid>

        {/* 물품 도착 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="물품 도착 주소" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.endAddress} />
          </Grid>
        </Grid>

        {/* 상세 주소(받는분 측 입력) */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="상세 주소 입력" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={passedOrderSheet?.endRestAddress ?? ""} />
          </Grid>
        </Grid>

        {/* 휴대전화(받는분) */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="휴대전화" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <ReadOnly sx={{ width: "15%" }} value={rp1} />
            <Typography variant="h6">-</Typography>
            <ReadOnly sx={{ width: "20%" }} value={rp2} />
            <Typography variant="h6">-</Typography>
            <ReadOnly sx={{ width: "20%" }} value={rp3} />
          </Grid>
        </Grid>

        {/* 받는분 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="이메일" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <ReadOnly sx={{ flex: 1, maxWidth: 150 }} value={addresseeEmailLocal} />
            <Typography variant="h6">@</Typography>
            <ReadOnly sx={{ flex: 1, maxWidth: 300 }} value={addresseeEmailDomain} />
          </Grid>
        </Grid>
      </Paper>

      {/* ===== 결제/요금 요약 (읽기 전용) ===== */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          결제 요약
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="기본요금" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.baseCost} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="거리요금" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.distanceCost} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="옵션요금" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.specialOptionCost} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}><LabelBox text="총 결제금액" /></Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <ReadOnly fullWidth value={serverData.totalCost} />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrderSummaryReadOnly;