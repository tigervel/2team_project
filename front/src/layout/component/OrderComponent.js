import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Divider,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControl,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TmapViewer from "./TmapViewer";

const SPECIAL_NOTE_OPTIONS = [
  { label: "냉동식품 및 유제품", cost: 300000 },
  { label: "위험물", cost: 500000 },
  { label: "파손주의", cost: 150000 },
];

export default function OrderComponent() {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [specialNotes, setSpecialNotes] = useState([]);
  const [specialNoteCost, setSpecialNoteCost] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [tab, setTab] = useState("map"); // 'map' or 'price'

  useEffect(() => {
    const base = cargoWeight <= 1000 ? 250000 : 350000;
    setBaseCost(base);
    const distCost = distanceKm * 1000;
    setDistanceCost(distCost);
    setTotalCost(Number(base) + Number(distCost) + Number(specialNoteCost));
  }, [cargoWeight, distanceKm, specialNoteCost]);

  const handleSpecialNoteChange = (event) => {
    const selected = SPECIAL_NOTE_OPTIONS.filter((opt) =>
      event.target.value.includes(opt.label)
    );
    setSpecialNotes(selected);
    setSpecialNoteCost(selected.reduce((acc, cur) => acc + cur.cost, 0));
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
      console.error("거리 계산 실패", e);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        py: 6,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={4}>
        견적서 작성
      </Typography>

      {/* 주소 입력 */}
      <Grid container spacing={2} alignItems="center" mb={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="출발지 주소"
            variant="filled"
            value={startAddress}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(setStartAddress)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { backgroundColor: "#f3f3f3", borderRadius: 2 },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="도착지 주소"
            variant="filled"
            value={endAddress}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(setEndAddress)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { backgroundColor: "#f3f3f3", borderRadius: 2 },
            }}
          />
        </Grid>
      </Grid>

      {/* 본문 영역 */}
      <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
        {/* 좌측 입력 영역 */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <TextField
              placeholder="예상 거리(km)"
              variant="filled"
              value={distanceKm}
              InputProps={{
                readOnly: true,
                disableUnderline: true,
                sx: { backgroundColor: "#f3f3f3", borderRadius: 2, width:500},
              }}
              fullWidth
            />
            <TextField
              placeholder="화물 종류"
              variant="filled"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { backgroundColor: "#f3f3f3", borderRadius: 2 },
              }}
              fullWidth
            />
            <TextField
              placeholder="화물 무게 (kg)"
              variant="filled"
              type="number"
              value={cargoWeight}
              onChange={(e) => setCargoWeight(Number(e.target.value))}
              InputProps={{
                disableUnderline: true,
                sx: { backgroundColor: "#f3f3f3", borderRadius: 2 },
              }}
              fullWidth
            />
            <FormControl fullWidth>
              <Select
                multiple
                displayEmpty
                value={specialNotes.map((n) => n.label)}
                onChange={handleSpecialNoteChange}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.join(", ") || "특이사항 선택"}
              >
                {SPECIAL_NOTE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.label} value={opt.label}>
                    <Checkbox checked={specialNotes.map((n) => n.label).includes(opt.label)} />
                    <ListItemText primary={`${opt.label} (+${opt.cost.toLocaleString()}원)`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {specialNotes.length > 0 && (
              <Box sx={{ bgcolor: "#eee", p: 2, borderRadius: 2 }}>
                {specialNotes.map((note) => (
                  <Typography key={note.label} fontSize={14}>
                    {note.label} &nbsp;&nbsp;&nbsp;&nbsp; +{note.cost.toLocaleString()}원
                  </Typography>
                ))}
              </Box>
            )}

            <Button variant="contained" fullWidth onClick={calculateDistance}>
              거리 계산
            </Button>
          </Stack>
        </Grid>

        {/* 우측 지도 or 금액 */}
        <Grid item xs={12} md={5}>
          <Stack direction="row" spacing={1} mb={1}>
            <Button
              variant={tab === "map" ? "contained" : "outlined"}
              onClick={() => setTab("map")}
            >
              지도
            </Button>
            <Button
              variant={tab === "price" ? "contained" : "outlined"}
              onClick={() => setTab("price")}
            >
              금액 산정
            </Button>
          </Stack>

          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              minHeight: 300,
              minWidth:500,
              backgroundColor: "white",
            }}
          >
            {tab === "map" ? (
              <TmapViewer startAddress={startAddress} endAddress={endAddress} />
            ) : (
              <>
                <Typography mb={1}>기본 요금: {baseCost.toLocaleString()}원</Typography>
                <Typography mb={1}>거리 요금: {distanceCost.toLocaleString()}원</Typography>
                <Typography mb={1}>추가 요금: {specialNoteCost.toLocaleString()}원</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  총 금액: {totalCost.toLocaleString()}원
                </Typography>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* 하단 버튼 */}
      <Stack direction="row" spacing={2} justifyContent="center" mt={6}>
        <Button variant="outlined" sx={{ minWidth: 140 }}>임시 저장</Button>
        <Button variant="contained" sx={{ minWidth: 140 }}>견적서 제출</Button>
        <Button variant="text" sx={{ minWidth: 140 }}>취소</Button>
      </Stack>
    </Box>
  );
}
