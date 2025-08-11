import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { postOrderPome } from "../../../api/orderAPI/orderApi";
import OrderPaymentSelect from "./OrderPaymentSelect";

// ===== 시안 맞춤 고정 폭 =====
const LABEL_WIDTH = 120; // 라벨 박스 고정폭 (콜론 맞춤, 우측정렬)
const NAME_WIDTH = 110; // 주문자/받는분 입력 상자 폭
const LONG_INPUT_WIDTH = 620; // 긴 주소/상세주소 폭 (시안 기준 넓은 입력)

const iniState = {
  addressee: '',
  phone: '',
  addresseeEmail: '',
  startRestAddress: '',
  endRestAddress: ''
}


const serverInitState = {
  ordererName: '홍',
  ordererPhone: '111111111111',
  ordererEmail: 'abc@abc.com',
  startAddress: '',
  endAddress: '',
  baseCost: '',
  distanceCost: '',
  specialOptionCost: '',
  totalCost: '1',
  matchingNo: ''

}
const OrderComponent = () => {
  const [serverData, setServerdata] = useState(serverInitState);
  const [orderSheet, setOrderSheet] = useState(iniState);
  const { state } = useLocation();
  const matchingNo = state?.matchingNo;

  useEffect(() => {
    if (matchingNo) {
      postOrderPome(matchingNo)
        .then((data) => setServerdata(data))
        .catch(console.error)
    }
  }, [matchingNo]);
  // 금액 상태 (실제 로직 연결 예정)

  const [senderName] = useState("홍길동");
  const [receiverName] = useState("홍길동");

  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [emailDomain2, setEmailDomain2] = useState("naver.com");
  const [payMethod, setPayMethod] = useState("card");

  const LabelBox = (props) => (
    <Box sx={{ width: LABEL_WIDTH, pr: 2, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
      <Typography sx={{ fontWeight: 600 }}>{props.text} :</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
        주문서 작성
      </Typography>
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          출발지 정보 입력
        </Typography>
      </Box>
      {/* ===== 출발지 정보 입력 ===== */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>


        {/* 주문자 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="주문자" />
          </Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <TextField size="small" sx={{ width: NAME_WIDTH }} value={serverData.ordererName} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 물품 출발 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="물품 출발 주소" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth value={serverData.startAddress} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 상세 주소 입력 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="상세 주소 입력" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="상세 주소" fullWidth />
          </Grid>
        </Grid>

        {/* 휴대전화 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="휴대전화" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ width: "15%" }} defaultValue="010" inputProps={{ readOnly: true }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} inputProps={{ readOnly: true }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="이메일" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ flex: 1 }} defaultValue="abcd1234" inputProps={{ readOnly: true }} />
            <Typography variant="h6">@</Typography>
            <TextField size="small" sx={{ flex: 1 }} placeholder="도메인" disabled={emailDomain !== "custom"} inputProps={{ readOnly: true }} />
            <Select
              size="small"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="custom">직접입력</MenuItem>
            </Select>

          </Grid>
        </Grid>
      </Paper>
      {/* ===== 도착지 정보 입력 ===== */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          도착지 정보 입력
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>


        {/* 받는분 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="받는분" />
          </Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <TextField size="small" sx={{ width: NAME_WIDTH }} value={senderName} />
          </Grid>
        </Grid>

        {/* 물품 도착 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="물품 도착 주소" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth value={serverData.endAddress} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 상세 주소 입력 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="상세 주소 입력" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="상세 주소" fullWidth />
          </Grid>
        </Grid>

        {/* 휴대전화 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="휴대전화" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ width: "15%" }} defaultValue="010" />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} />
          </Grid>
        </Grid>

        {/* 받는분 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="이메일" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ flex: 1 }} defaultValue="abcd1234" />
            <Typography variant="h6">@</Typography>
            <TextField size="small" sx={{ flex: 1 }} disabled={emailDomain !== "custom"} />
            <Select
              size="small"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="custom">직접입력</MenuItem>
            </Select>

          </Grid>
        </Grid>
      </Paper>

      {/* ===== 결제 섹션 ===== */}


    <OrderPaymentSelect serverData={serverData} orderSheet={orderSheet}/>
    </Box>
  );
}
export default OrderComponent;