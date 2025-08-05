import React, { useState, useEffect } from "react";
import {
  TextField, Button, Stack, Typography, Select, MenuItem,
  FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
  Box, IconButton, InputAdornment, Grid, useMediaQuery, useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TmapViewer from "./KakaoMapViewer";
// Date picker imports removed - using regular TextField for date input
import dayjs from "dayjs";
import KakaoMapViewer from "./KakaoMapViewer";





const SPECIAL_NOTE_OPTIONS = [
  { label: "냉동식품 및 유제품", cost: 300000 },
  { label: "위험물", cost: 500000 },
  { label: "파손주의", cost: 150000 },
];

const EstimateComponent = () => {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [specialNotes, setSpecialNotes] = useState([]);
  const [specialNoteCost, setSpecialNoteCost] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [dateTime, setDateTime] = useState(dayjs());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const base = cargoWeight <= 1000 ? 250000 : 350000;
    const distCost = distanceKm * 1000;
    const extra = specialNotes.reduce((sum, n) => sum + n.cost, 0);
    setBaseCost(base);
    setDistanceCost(distCost);
    setSpecialNoteCost(extra);
    setTotalCost(base + distCost + extra);
  }, [cargoWeight, distanceKm, specialNotes]);

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
      const start = await fetchCoords(startAddress);
      const end = await fetchCoords(endAddress);

      const routeUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}`;
      const res = await fetch(routeUrl, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      });
      const data = await res.json();
      const meters = data.routes[0].summary.distance;
      setDistanceKm((meters / 1000).toFixed(1));
    } catch (e) {
      console.error("거리 계산 오류", e);
    }
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
            value={startAddress}

            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(setStartAddress)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 520 }}
          />

          <TextField
            placeholder="도착지 주소"
            value={endAddress}

            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(setEndAddress)}>
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
              value={distanceKm}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="화물 종류"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              fullWidth
            />
            <TextField
              label="화물 무게(kg)"
              type="number"
              value={cargoWeight}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0) setCargoWeight(value);
                else setCargoWeight("");
              }}
              fullWidth
            />
            <TextField
              label="예약 시간"
              type="datetime-local"
              value={dateTime ? dayjs(dateTime).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={(e) => setDateTime(dayjs(e.target.value).toDate())}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

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
                bgcolor: "#fff",
              }}
            >
              {showMap ? (
                <KakaoMapViewer startAddress={startAddress} endAddress={endAddress} />
              ) : (
                <Stack spacing={2}>
                  <Typography>기본 요금: {baseCost.toLocaleString()}원</Typography>
                  <Typography>거리 요금: {distanceCost.toLocaleString()}원</Typography>
                  <Typography>추가 요금: {specialNoteCost.toLocaleString()}원</Typography>
                  <Typography fontWeight="bold" mt={2} sx={{ fontSize: 30}}>
                    총 금액: {totalCost.toLocaleString()}원
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
        <Button variant="contained" fullWidth>
          임시 저장
        </Button>
        <Button variant="contained" fullWidth>
          견적서 제출
        </Button>
        <Button variant="contained" fullWidth>
          취소
        </Button>
      </Stack>
    </Box>
  );
}
export default EstimateComponent;
