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

// ===== 시안 맞춤 고정 폭 =====
const LABEL_WIDTH = 120; // 라벨 박스 고정폭 (콜론 맞춤, 우측정렬)
const NAME_WIDTH = 110; // 주문자/받는분 입력 상자 폭
const LONG_INPUT_WIDTH = 620; // 긴 주소/상세주소 폭 (시안 기준 넓은 입력)

const iniState ={
  addressee:'',
  phone:'',
  addresseeEmail:'',
  startRestAddress:'',
  endRestAddress:''
}


const serverInitState = {
  ordererName:'',
  ordererPhone:'',
  ordererEmail:'',
  startAddress:'',
  endAddress:'',
  baseCost:'',
  distanceCost:'',
  specialOptionCost:'',
  totalCost:'',
  matchingNo:''

}
const OrderComponent=()=> {
  const [serverData,setServerdata] = useState(serverInitState);
  const [orderSheet,setOrderSheet] = useState(iniState);

  const { state } = useLocation();
  const matchingNo = state?.matchingNo;

  useEffect(()=>{
    if(matchingNo) {
      postOrderPome(matchingNo)
      .then((data) => setServerdata(data))
      .catch(console.error)
    }
  },[matchingNo]);
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
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh" }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
        주문서 작성
      </Typography>

      {/* ===== 출발지 정보 입력 ===== */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          출발지 정보 입력
        </Typography>

        {/* 주문자 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="주문자" />
          </Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <TextField size="small" sx={{ width: NAME_WIDTH }} value={serverData.ordererName} inputProps={{ readOnly : true}} />
          </Grid>
        </Grid>

        {/* 물품 출발 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="물품 출발 주소" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth  value={serverData.startAddress} inputProps={{ readOnly : true}}  />
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
            <TextField size="small" sx={{ width: "15%" }} defaultValue="010"  inputProps={{ readOnly : true}} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }}  inputProps={{ readOnly : true}} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }}  inputProps={{ readOnly : true}} />
          </Grid>
        </Grid>

        {/* 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="이메일" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ flex: 1 }} defaultValue="abcd1234"  inputProps={{ readOnly : true}} />
            <Typography variant="h6">@</Typography>
            <TextField size="small" sx={{ flex: 1 }} placeholder="도메인" disabled={emailDomain !== "custom"}  inputProps={{ readOnly : true}} />
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
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          도착지 정보 입력
        </Typography>

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
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth  value={serverData.endAddress} inputProps={{ readOnly : true}} />
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
            <TextField size="small" sx={{ flex: 1 }}  disabled={emailDomain !== "custom"} />
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
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              결제 방법
            </Typography>

            <ToggleButtonGroup
              exclusive
              value={payMethod}
              onChange={(_, v) => v && setPayMethod(v)}
              sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}
            >
              <ToggleButton value="card" sx={{ px: 3, py: 1.5, borderRadius: 2 }}>신용·체크카드</ToggleButton>
              <ToggleButton value="toss" sx={{ px: 3, py: 1.5, borderRadius: 2 }}>toss pay</ToggleButton>
              <ToggleButton value="kakao" sx={{ px: 3, py: 1.5, borderRadius: 2 }}>k pay</ToggleButton>
              <ToggleButton value="naver" sx={{ px: 3, py: 1.5, borderRadius: 2 }}>N pay</ToggleButton>
            </ToggleButtonGroup>

            <Grid container alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Grid item>
                <LabelBox text="카드사 선택" />
              </Grid>
              <Grid item>
                <Select size="small" sx={{ width: LONG_INPUT_WIDTH }} defaultValue="">
                  <MenuItem value="">카드사 선택</MenuItem>
                  <MenuItem value="hyundai">현대카드</MenuItem>
                  <MenuItem value="kb">국민카드</MenuItem>
                  <MenuItem value="shinhan">신한카드</MenuItem>
                  <MenuItem value="lotte">롯데카드</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <LabelBox text="할부" />
              </Grid>
              <Grid item>
                <Select size="small" sx={{ width: LONG_INPUT_WIDTH }} defaultValue="0">
                  <MenuItem value="0">일시불</MenuItem>
                  <MenuItem value="2">2개월</MenuItem>
                  <MenuItem value="3">3개월</MenuItem>
                  <MenuItem value="6">6개월</MenuItem>
                  <MenuItem value="12">12개월</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>총 결제금액</Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">기본 운송 요금</Typography>
              <Typography variant="body2">{serverData.baseCost} 원</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">거리별 요금</Typography>
              <Typography variant="body2">{serverData.distanceCost} 원</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">추가 요금</Typography>
              <Typography variant="body2">{serverData.specialOptionCost} 원</Typography>
            </Box>

            <Divider />

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{serverData.totalCost}원</Typography>
            </Box>

            <Button variant="contained" size="large" sx={{ mt: "auto", borderRadius: 2 }}>
              결제하기
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
 export default OrderComponent;