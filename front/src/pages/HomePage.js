import React from "react";
import { Box, Typography, Grid, Button, TextField, Card, CardContent, CardMedia } from "@mui/material";
import Carousel from "react-material-ui-carousel";

const HomePage = () => {
  const vehicleTypes = [
    { id: 1, name: "소형", image: "/images/small-truck.png" },
    { id: 2, name: "중형", image: "/images/medium-truck.png" },
    { id: 3, name: "대형", image: "/images/large-truck.png" }
  ];

  const notices = [
    { id: 1, title: "공지사항 1" },
    { id: 2, title: "긴급 점검 안내" },
    { id: 3, title: "서비스 이용 가이드 업데이트" }
  ];

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
          {vehicleTypes.map(vehicle => (
            <Grid item key={vehicle.id}>
              <Card sx={{ width: 350, height: 250 }}>
                <CardMedia component="img" height="120" image={vehicle.image} alt={vehicle.name} />
                <CardContent>
                  <Typography align="center">{vehicle.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button variant="contained" sx={{ mt: 2 }}>더보기</Button>
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
                    <TextField label="출발지" fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="도착지" fullWidth />
                  </Grid>
                </Grid>
                <TextField label="화물종류" fullWidth sx={{ mt: 2 }} />
                <TextField label="화물특수" fullWidth sx={{ mt: 2 }} />
                <Typography variant="caption" sx={{ mt: 1, mb: 2 }}>*예상단가표</Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained">조회하기</Button>
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
