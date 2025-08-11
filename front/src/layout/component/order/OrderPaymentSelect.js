import React, { useEffect, useState } from "react";
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
import { requestPayment } from "../../../api/paymentApi/paymentUtil";
import useCustomMove from "../../../hooks/useCustomMove";
import { postOrderCreate } from "../../../api/orderAPI/orderApi";

const CHANNELS = {
    CARD: "channel-key-279bfb34-a441-4da9-aeb3-48011004f6c2",
    TOSS: "channel-key-480547ae-0d47-46fb-bd42-b41a7c102111",
    KAKAO: "channel-key-aaecd5d1-a431-49b8-b800-930a6fdb89c1",
    NAVER: "channel-key-<네이버 채널키>",
}
const iniState = {
    payMethod: "",
    channelKey: "",
    provider: ""
}


const OrderPaymentSelect = ({ serverData, orderSheet }) => {
    const { moveToHome } = useCustomMove();
    const [orderNo, setOrderNo] = useState("")
    const [paymentType, setPaymentType] = useState(null);


    const handleClick = () => {
        console.log(serverData.matchingNo)
        const orderData = {
            orderName: (serverData.ordererName),
            totalAmount: Number(serverData?.totalCost ?? 0),
            channelKey: (orderType.channelKey),
            payMethod: (orderType.payMethod),
            customerName: (serverData.ordererName),
            customerPhone: (serverData.ordererPhone),
            customerEmail: (serverData.ordererEmail),
        }

        requestPayment(orderData).then((res) => {
            const payload = {
                ...orderSheet,
                matchingNo: Number(serverData.matchingNo)
            }

            const newOrderNo = postOrderCreate(payload)
            setOrderNo(newOrderNo); //오더번호 리턴받아 저장
            

            console.log("결제 완료 : ", res)

            alert("주문이 완료 되었습니다.")
            moveToHome();

        }).catch((err) => {
            console.log("결제 실패 : ", err)
        })
    }

    const [orderType, setOrderType] = useState(iniState);

    const handleSelectMethod = (e) => {

        const key = e.currentTarget.name; // "CARD" | "TOSS" | "KAKAO" | "NAVER"
        setPaymentType(key)
        if (key === "CARD") {
            setOrderType({ payMethod: "CARD", channelKey: CHANNELS.CARD, provider: "CARD" });
        } else if (key === "TOSS") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.TOSS, provider: "TOSS" });
        } else if (key === "KAKAO") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.KAKAO, provider: "KAKAO" });
        } else if (key === "NAVER") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.NAVER, provider: "NAVER" });
        }
        console.log(e.currentTarget.name)
        console.log(orderType.channelKey)
    };



    return (
        <Grid
            container
            spacing={3}
            sx={{ maxWidth: 850, mx: "auto", mt: 4 }}   // 위 섹션과 같은 컨테이너 폭
            alignItems="stretch"
            justifyContent={"space-between"}
            wrap="nowrap"

        >
            {/* ===== 결제 섹션 ===== */}

            {/* 좌측: 결제 방법 (밑줄만, Paper X) */}
            <Grid item xs={12} md={7} sx={{ minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                        결제 방법
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Button name="CARD" variant={paymentType === 'CARD' ? "contained" : "outlined"} sx={{ px: 1, py: 1.5, borderRadius: 2 }} onClick={handleSelectMethod}>신용·체크카드</Button>
                        <Button name="TOSS" variant={paymentType === 'TOSS' ? "contained" : "outlined"} sx={{ p: 0, borderRadius: 2 }} onClick={handleSelectMethod}>
                            <img
                                src="../../image/logo/TossPay_Logo_Primary.png"
                                style={{ width: 100, height: 40 }}
                            />
                        </Button>
                        <Button name="KAKAO" variant={paymentType === 'KAKAO' ? "contained" : "outlined"} sx={{ width: 100, p: 0, borderRadius: 2, }} onClick={handleSelectMethod}>
                            <img
                                src="../../image/logo/payment_icon_yellow_medium.png"
                                style={{ width: 80, height: 30, borderRadius: 7 }}
                            />
                        </Button>
                        <Button variant="outlined" sx={{ width: 100, px: 3, py: 1.5, borderRadius: 2 }}>
                            <img
                                src="../../image/logo/logo_navergr_small.svg"
                                style={{ width: 70, height: 20, borderRadius: 7 }}
                            />
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* 우측: 총 결제금액 (깨짐 방지 카드) */}
            <Grid item xs={12} md={5} sx={{ minWidth: 0 }}>
                <Paper
                    variant="outlined"
                    sx={{ p: 3, borderRadius: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>총 결제금액</Typography>

                    {/* 라벨 / 금액 / '원' → 3열 고정 */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", rowGap: 1, columnGap: 1 }}>
                        <Typography color="text.secondary">기본 운송 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.baseCost != null ? Number(serverData.baseCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>

                        <Typography color="text.secondary">거리별 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.distanceCost != null ? Number(serverData.distanceCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>

                        <Typography color="text.secondary">추가 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.specialOptionCost != null ? Number(serverData.specialOptionCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {serverData.totalCost != null ? Number(serverData.totalCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>원</Typography>
                    </Box>

                    <Button variant="contained" size="large" sx={{ mt: "auto", borderRadius: 2 }} onClick={() => handleClick()}>
                        결제하기
                    </Button>
                </Paper>
            </Grid>
        </Grid>


    )
}

export default OrderPaymentSelect;