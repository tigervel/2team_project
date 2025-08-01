const AdminDashboard = () => {

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                이용통계
            </Typography>

            <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                <Typography>사용자수</Typography>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                <Typography>총 매출</Typography>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                <Typography>현재 배송건</Typography>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                <Typography>총 배송건</Typography>
            </Paper>
        </Box>
    );
}
export default AdminDashboard;