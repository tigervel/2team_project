import { Box, Grid, Paper, Typography } from "@mui/material";
import { BarElement, CategoryScale, Chart, Legend, LinearScale, scales, Title, Tooltip } from "chart.js";
import { useEffect, useRef } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminPage = () => {

  const barData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '월 별 배송내역',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const piedata = {
    labels: [
      '물주',
      '화주',
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [300, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
      ],
      hoverOffset: 4
    }]
  };

  const pieOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }} >
      < Typography variant="h4" fontWeight="bold" gutterBottom>
        이용 통계
      </Typography >

      <Box display="flex" gap={2} mb={4}>
        {[
          { label: "사용자수", value: "12명" },
          { label: "총 매출", value: "24,000원" },
          { label: "현재 배송건", value: "3건" },
          { label: "총 배송건", value: "87건" },
        ].map((item, idx) => (
          <Paper
            key={idx}
            elevation={3}
            sx={{
              flex: 1,
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1">{item.label}</Typography>
            <Typography variant="h5" fontWeight="bold">
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      < Grid display="flex" gap={2} flex={1}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              width: 600,
              height: 400
            }}
          >
            <Typography variant="h6" mb={2}>
              사용자 비율
            </Typography>
            <Box flex={1}>
              <Doughnut data={piedata} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              width: 600,
              height: 400
            }}
          >
            <Typography variant="h6" mb={2}>
              월별 배송 내역
            </Typography>
            <Box flex={1}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid >

      < Paper sx={{ p: 2, mb: 3 }} display="flex">
        <Typography fontSize={16} fontWeight="bold" mb={2}>
          현재 배송 진행건
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {["홍콩 → 부산", "서울", "대구", "Germany"].map((item, idx) => (
            <li key={idx}>
              <Typography fontSize={14}>{item}</Typography>
            </li>
          ))}
        </Box>
      </Paper >

      < Paper sx={{ p: 2 }}>
        <Typography fontSize={16} fontWeight="bold" mb={2}>
          지난 배송 내역
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {[
            "홍콩 → 부산",
            "서울",
            "대구",
            "Germany",
            "Romania",
            "Japan",
            "Netherlands",
          ].map((item, idx) => (
            <li key={idx}>
              <Typography fontSize={14}>{item}</Typography>
            </li>
          ))}
        </Box>
      </Paper >
    </Box >
  )
};

export default AdminPage;
