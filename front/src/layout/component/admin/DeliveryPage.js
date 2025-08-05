import React, { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    TextField,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DeliveryPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const deliveryData = [
        {
            id: 1,
            name: "김물주",
            email: "mulzu@gmail.com",
            phone: "010-1234-5678",
            orders: 3,
            status: "배송",
        },
    ];

    const handleTabChange = (e, newValue) => setActiveTab(newValue);
    const handleSearch = () => {
        console.log("검색:", searchKeyword);
    };
    const handleRowClick = (user) => setSelectedUser(user);

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">
                    배송조회
                </Typography>
                <TextField
                    variant="outlined"
                    placeholder="Search"
                    size="small"
                    value={searchKeyword}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
                    }}
                />
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>이름</TableCell>
                            <TableCell>email</TableCell>
                            <TableCell>전화번호</TableCell>
                            <TableCell>주문수</TableCell>
                            <TableCell>주문현황</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveryData.map((user) => (
                            <TableRow
                                key={user.id}
                                hover
                                onClick={() => handleRowClick(user)}
                                style={{ cursor: "pointer" }}
                            >
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.orders}</TableCell>
                                <TableCell>{user.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {selectedUser && (
                <Box mt={4}>
                    <Typography variant="h6" mb={1}>
                        상세 정보
                    </Typography>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography>출발 날짜: 2025.09.18</Typography>
                        <Typography>출발지: 서울특별시 강서구 공항대로 200</Typography>
                        <Typography>도착지: 강원도 춘천시 동산면 근자리 12</Typography>
                        <Typography>거리: 105KM</Typography>
                        <Typography>종류: 목재</Typography>
                        <Typography>금액: 559,000원</Typography>
                        <Typography>화물주: 이화주</Typography>
                    </Paper>

                    <Typography variant="h6" mb={1}>
                        지난 배송 내역
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        <Typography>충주 - 부산 4.5M</Typography>
                        <Typography>서울 2.3M</Typography>
                        <Typography>대구 2M</Typography>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default DeliveryPage;
