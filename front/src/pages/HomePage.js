import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, TextField, Card, CardContent, CardMedia, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import SearchIcon from "@mui/icons-material/Search";
import { postSearchFeesBasic } from "../api/estimateApi/estimateApi";
import { calculateDistanceBetweenAddresses } from "../layout/component/common/calculateDistanceBetweenAddresses";
import { basicList } from "../api/adminApi/adminApi";
import MainFeesUtil from "../layout/component/common/MainFeesUtil";
const initState = {
  startAddress: '',
  endAddress: '',
  cargoType: '',
  cargoWeight: '',
  totalCost: 0,
  distanceKm: ''

}

const HomePage = () => {
  const [estimate, setEstimate] = useState(initState);
  const [fees, setFees] = useState([]);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [exPrice, setExprice] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFees = showAll ? fees : fees.slice(0, 3);

  const DEFAULT_TRUCK_IMG = "/image/placeholders/truck.svg";
  const normalizeUrl = (p) =>
    !p ? null : p.startsWith("http") ? p : p.startsWith("/") ? p : `/uploads/trucks/${p}`;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await postSearchFeesBasic();
        setFees(data);
      } catch (error) {
        console.log("API 호출 실패", error)
      }
    };
    fetchData()
  }, []);

  useEffect(() => {
    const fee = fees.find(f => f.weight === estimate.cargoWeight) || null
    const dist = Number(estimate.distanceKm ?? 0);
    const base = Number(fee?.initialCharge ?? 0);
    const rate = Number(fee?.ratePerKm ?? 0);
    const distCost = dist * rate;
    const total = base + distCost;
    setBaseCost(base);
    setDistanceCost(distCost);

    setEstimate(prev => ({
      ...prev,
      totalCost: total,
      baseCost: base,
      distanceCost: distCost,

    }))

    setExprice(total);
  }, [estimate.cargoWeight, estimate.distanceKm, fees]);

  const vehicleTypes = [(
    { id: 1, name: "소형", image: "/images/small-truck.png" },
    { id: 2, name: "중형", image: "/images/medium-truck.png" },
    { id: 3, name: "대형", image: "/images/large-truck.png" })
  ];

  const notices = [
    { id: 1, title: "공지사항 1" },
    { id: 2, title: "긴급 점검 안내" },
    { id: 3, title: "서비스 이용 가이드 업데이트" }
  ];
  const handleAddressSearch = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setter(data.address);
      },
    }).open();


  }

  const calculateDistance = async () => {
    try {
      const km = await calculateDistanceBetweenAddresses(
        estimate.startAddress,
        estimate.endAddress
      );
      setEstimate(prev => ({ ...prev, distanceKm: km }));
    } catch (err) {
      alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
    }
  };

  //const price = baseCost+distanceCost;
  return (
    <Box>
      <Carousel animation="fade" indicators={false} >
        <Box sx={{
          height: 400,
          backgroundColor: "#90a8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: 'url(/image/logo/CargoPhoto.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <Typography variant="h3" color="white">여기는 메인페이지여</Typography>
        </Box>
        <Box sx={{
          height: 400,
          backgroundColor: "#b8a8ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: 'url(/image/logo/CargoPhoto2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <Typography variant="h3" color="white">SUMMER 2025</Typography>
        </Box>
      </Carousel>

      {/* 🚚 차량 종류 */}
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>차량 종류</Typography>

        <Grid container spacing={2} justifyContent="center">
          {visibleFees.map((basic) => {
            const img = normalizeUrl(basic.cargoImage) || DEFAULT_TRUCK_IMG;
            return (
              <Grid item key={basic.tno}>
                <Card sx={{ width: 350, height: 250 }} >
                   <MainFeesUtil key={basic.tno} tno={basic.tno} />
        
                  <CardContent>
                    <Typography align="center">{basic.weight}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {fees.length > 3 && (
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "접기" : "더보기"}
          </Button>
        )}
      </Box>

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 6 }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', px: 2 }}>
          <Grid container spacing={5} justifyContent="center">
            {/* 간편조회 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>간편조회</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
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

                    />
                  </Grid>
                  <Grid item xs={6}>
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

                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="cargo-fee-label">화물 무게</InputLabel>
                  <Select
                    labelId="cargo-fee-label"
                    label="화물 무게"
                    name="cargoWeight"
                    value={estimate.cargoWeight || ''}
                    onChange={(e) => {
                      const weightLabel = e.target.value;
                      setEstimate(prev => ({ ...prev, cargoWeight: weightLabel }));
                    }}
                  >
                    {fees.map(fee => (
                      <MenuItem key={fee.tno} value={fee.weight}>
                        {fee.weight} {/* 예: 1톤, 2톤 */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* <TextField label="화물특수" fullWidth sx={{ mt: 2 }} /> */}
                <Typography variant="caption" sx={{ mt: 1, mb: 2 }}>*예상단가표 {Number(exPrice)}원</Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={calculateDistance} >
                    조회하기
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* 공지사항 */}
            <Grid item xs={12} >
              <Typography variant="h6" fontWeight="bold" gutterBottom>공지사항</Typography>

              <Grid container spacing={0.5}>
                {notices.map((notice, index) => (
                  <Grid item xs={12} key={notice.id} sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        '&:hover': { backgroundColor: '#f9f9f9' }
                      }}
                    >
                      <a
                        href={notice.url}
                        style={{
                          textDecoration: 'none',
                          color: '#333'
                        }}
                      >
                        {notice.title}
                      </a>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

          </Grid>

        </Box >
      </Box >


    </Box >
  );
};

export default HomePage;
