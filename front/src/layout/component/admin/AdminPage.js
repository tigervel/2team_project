import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { API_SERVER_HOST } from "../../../api/serverConfig";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const makeBarOptions = (maxValue, title) => {
  const suggested = Math.max(Math.ceil((maxValue || 0) * 1.25), 10);
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: suggested,
        ticks: { precision: 0 },
        grid: { drawBorder: false },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
      title: { display: true, text: title, font: { size: 18, weight: "bold" } },
      legend: { display: true, position: "top" },
      tooltip: { intersect: false, mode: "index" },
    },
  };
};

const AdminPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_SERVER_HOST}/g2i4/admin/dashboard`);
        const d = res.data || {};
        setDashboardData({
          ...d,
          monthlyDeliveries: d.monthlyDeliveries || [],
          newMembersByMonth: d.newMembersByMonth || [],
          currentDeliveries: d.currentDeliveries || [],
          pastDeliveries: d.pastDeliveries || [],
        });
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 다시 시도해 주세요.");
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">표시할 데이터가 없습니다.</Alert>
      </Box>
    );
  }

  const deliveriesLabels = dashboardData.monthlyDeliveries.map((it) => it.month);
  const deliveriesCounts = dashboardData.monthlyDeliveries.map((it) => it.count);
  const newMembersLabels = dashboardData.newMembersByMonth.map((it) => it.month);
  const newMembersCounts = dashboardData.newMembersByMonth.map((it) => it.count);

  const deliveriesMax = Math.max(0, ...deliveriesCounts);
  const newMembersMax = Math.max(0, ...newMembersCounts);

  const barData = {
    labels: deliveriesLabels,
    datasets: [
      {
        label: "월 별 배송내역",
        data: deliveriesCounts,
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const bar2Data = {
    labels: newMembersLabels,
    datasets: [
      {
        label: "신규 회원가입",
        data: newMembersCounts,
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(255, 159, 64)",
          "rgb(255, 99, 132)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const barOptions = makeBarOptions(deliveriesMax, "월별 배송 내역");
  const bar2Options = makeBarOptions(newMembersMax, "신규 회원가입");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        이용 통계
      </Typography>

      <Box display="flex" gap={2} mb={4}>
        {[
          { label: "사용자수", value: dashboardData.totalUsers },
          { label: "이번달 매출", value: dashboardData.monthlyRevenue },
          { label: "신규회원", value: dashboardData.newMembers },
          { label: "총 배송건", value: dashboardData.totalDeliveries },
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

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Bar data={bar2Data} options={bar2Options} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Bar data={barData} options={barOptions} />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography fontSize={16} fontWeight="bold" mb={2}>
          현재 배송 진행건
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {dashboardData.currentDeliveries.map((item, idx) => (
            <li key={idx}>
              <Typography fontSize={14}>{item}</Typography>
            </li>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontSize={16} fontWeight="bold" mb={2}>
          지난 배송 내역
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {dashboardData.pastDeliveries.map((item, idx) => (
            <li key={idx}>
              <Typography fontSize={14}>{item}</Typography>
            </li>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPage;
