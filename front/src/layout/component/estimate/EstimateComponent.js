import React, { useState, useEffect } from "react";
import {
  TextField, Button, Stack, Typography, Select, MenuItem,
  FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
  Box, IconButton, InputAdornment, Grid, useMediaQuery, useTheme,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TmapViewer from "./KakaoMapViewer";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import KakaoMapViewer from "./KakaoMapViewer";
import { postAdd, postSaveEs } from "../../../api/estimateApi/estimateApi";
import useCustomMove from "../../../hooks/useCustomMove";





const SPECIAL_NOTE_OPTIONS = [
  { label: "냉동식품 및 유제품", cost: 300000 },
  { label: "위험물", cost: 500000 },
  { label: "파손주의", cost: 150000 },
];
const initState = {
  startAddress: '',
  endAddress: '',
  cargoType: '',
  cargoWeight: '',
  startTime: dayjs(),
  totalCost: 0,
  distanceKm: ''

}

const EstimateComponent = () => {

  const [estimate, setEstimate] = useState(initState);

  const [specialNotes, setSpecialNotes] = useState([]);
  const [specialNoteCost, setSpecialNoteCost] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const { moveToHome } = useCustomMove();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const base = estimate.cargoWeight <= 1000 ? 250000 : 350000;
    const distCost = estimate.distanceKm * 1000;
    const extra = specialNotes.reduce((sum, n) => sum + n.cost, 0);
    setBaseCost(base);
    setDistanceCost(distCost);
    setSpecialNoteCost(extra);
    setEstimate(prev => ({
      ...prev,
      totalCost: base + distCost + extra
    }))


  }, [estimate.cargoWeight, estimate.distanceKm, specialNotes]);

  const handleSpecialNoteChange = (e) => {
    const selectedLabels = e.target.value;
    const selected = SPECIAL_NOTE_OPTIONS.filter((n) =>
      selectedLabels.includes(n.label)
    );
    setSpecialNotes(selected);
  };

  const handleAddressSearch = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setter(data.address);
      },
    }).open();
  };

  const calculateDistance = async () => {
    const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=`;

    const fetchCoords = async (address) => {
      const res = await fetch(url + encodeURIComponent(address), {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      });
      const data = await res.json();
      const loc = data.documents[0];
      return { lat: loc.y, lng: loc.x };
    };

    try {
      const start = await fetchCoords(estimate.startAddress);
      const end = await fetchCoords(estimate.endAddress);

      const routeUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}`;
      const res = await fetch(routeUrl, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      });
      const data = await res.json();
      const meters = data.routes[0].summary.distance;
      const km = (meters / 1000).toFixed(1)

      setEstimate(prev => ({
        ...prev,
        distanceKm: km
      }))
    } catch (e) {
      console.error("거리 계산 오류", e);
    }
  };

  const handleClickAdd = () => {
    if ((estimate.distanceKm !== '')) {
      if (estimate.cargoType !== '') {
        if (estimate.cargoWeight !== '') {
          postAdd(estimate)
            .then(result => {
              alert('견적서 제출이 완료되었습니다.')
              moveToHome();
            })
        } else {
          alert('화물무게를 입력해주세요')
        }
      } else {
        alert('화물종류를 입력해주세요')
      }
    } else {
      alert('예상거리를 입력헤주세요')
    }
  }
  const handleChangeEstimate = (e) => {
    estimate[e.target.name] = e.target.value
    setEstimate({ ...estimate })
  }
  const handleClickSave = () => {
    postSaveEs(estimate)
      .then(data => {
        console.log(data)
        alert('임시저장이 완료되었습니다')
        moveToHome();
      }).catch(error => {
        const msg = error.response?.data?.message || error.response?.data?.error || "임시저장 중 오류가 발생했습니다.";
        alert(msg);
      })
  }

  const handleClickCancel = () => {
    setOpenCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setOpenCancelDialog(false);
    moveToHome();  // 실제 이동 처리
  };

  const handleCancelClose = () => {
    setOpenCancelDialog(false);  // 모달만 닫기
  };

  const tomorrow = dayjs().add(24, 'hour')

  const isInvalidHour = (data) => data.hour() < 9 || data.hour() > 16;

  const isBeforeMinDateTime = (date) => {
    return date.isBefore(tomorrow.startOf('day'));
  };
  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h5" fontWeight="bold" align="center" mb={5}>
        견적서 작성
      </Typography>



      <Grid
        container
        spacing={4}
        direction={isMobile ? "column" : "row"}
        justifyContent="center"
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          <TextField
            placeholder="출발지 주소"
            name="startAddress"
            value={estimate.startAddress}

            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(addr => (
                    setEstimate(prev => ({
                      ...prev, startAddress: addr
                    }))
                  ))}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 520 }}
          />

          <TextField
            placeholder="도착지 주소"
            name="endAddress"
            value={estimate.endAddress}

            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(addr => (
                    setEstimate(prev => ({
                      ...prev, endAddress: addr
                    }))
                  ))}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 520 }}
          />
        </Stack>

        {/* 좌측 입력 영역 */}
        <Grid item xs={12} md={"auto"}>

          <Stack spacing={2} sx={{ width: isMobile ? "100%" : 520 }}>
            <TextField
              label="예상 거리(km)"
              value={estimate.distanceKm}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="화물 종류"
              name='cargoType'
              value={estimate.cargoType}
              onChange={handleChangeEstimate}
              fullWidth
            />
            <TextField
              label="화물 무게(kg)"
              type="number"
              value={estimate.cargoWeight}
              onChange={(e) => {
                const value = Number(e.target.value);
                setEstimate((prev) => ({
                  ...prev,
                  cargoWeight: value >= 0 ? value : '',
                }))
              }}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="예약 시간"
                name='startTime'
                value={estimate.startTime}
                minDateTime={tomorrow}
                shouldDisableDate={(data) => {
                  return isBeforeMinDateTime(data.hour(9))
                }}
                shouldDisableTime={(value, clockType) => {
                  if (clockType === 'hours') {
                    return isInvalidHour(value)
                  }
                  return false;
                }}
                onChange={newTime => {
                  setEstimate(prev => ({ ...prev, startTime: newTime }))
                }}
                format="YYYY년 MM월 DD일 A hh:mm"
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>특이사항 선택</InputLabel>
              <Select
                multiple
                value={specialNotes.map((n) => n.label)}
                onChange={handleSpecialNoteChange}
                input={<OutlinedInput label="특이사항 선택" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {SPECIAL_NOTE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.label} value={opt.label}>
                    <Checkbox checked={specialNotes.some((n) => n.label === opt.label)} />
                    <ListItemText
                      primary={`${opt.label} +${opt.cost.toLocaleString()}원`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {specialNotes.length > 0 && (
              <Box bgcolor="#f1f1f1" borderRadius={2} p={2}>
                {specialNotes.map((note) => (
                  <Typography key={note.label} fontSize={14}>
                    {note.label}: +{note.cost.toLocaleString()}원
                  </Typography>
                ))}
              </Box>
            )}
            <Button variant="contained" fullWidth onClick={calculateDistance}>
              거리 계산
            </Button>
          </Stack>
        </Grid>

        {/* 우측 결과 영역 */}
        <Grid item xs={12} md={"auto"}>
          <Stack spacing={2} sx={{ width: isMobile ? "100%" : 520 }}>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                fullWidth
                variant={!showMap ? "contained" : "outlined"}
                onClick={() => setShowMap(false)}
              >
                금액 산정
              </Button>
              <Button
                size="small"
                fullWidth
                variant={showMap ? "contained" : "outlined"}
                onClick={() => setShowMap(true)}
              >
                지도
              </Button>
            </Stack>

            <Box
              sx={{
                minHeight: 300,
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                bgcolor: "#ffffff",
              }}
            >
              {showMap ? (
                <KakaoMapViewer startAddress={estimate.startAddress} endAddress={estimate.endAddress} />
              ) : (
                <Stack spacing={2}>
                  <Typography>기본 요금: {baseCost.toLocaleString()}원</Typography>
                  <Typography>거리 요금: {distanceCost.toLocaleString()}원</Typography>
                  <Typography>추가 요금: {specialNoteCost.toLocaleString()}원</Typography>
                  <Typography fontWeight="bold" mt={2} sx={{ fontSize: 30 }}>
                    총 금액: {estimate.totalCost.toLocaleString()}원
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* 제출 버튼들 */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        mt={5}
        alignItems="center"
      >
        <Button variant="contained" fullWidth onClick={handleClickSave}>
          임시 저장
        </Button>
        <Button variant="contained" fullWidth onClick={handleClickAdd}>
          견적서 제출
        </Button>
        <Button variant="contained" fullWidth onClick={handleClickCancel}>
          취소
        </Button>
      </Stack>

      <Dialog
        open={openCancelDialog}
        onClose={handleCancelClose}
        PaperProps={{
          sx: {
            width: 400,
            height: 150,
            borderRadius: 2,
            p: 2,


          },
        }}
      >

        <DialogContent >
          <Typography fontSize={20} fontWeight='bold'>작성을 취소하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm} color="error">
            확인
          </Button>
          <Button onClick={handleCancelClose} color="inherit">
            아니요
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default EstimateComponent;
