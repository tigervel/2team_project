import React, { useState } from "react";
import {
    Box, Typography, Tabs, Tab, TextField,
    Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DeliveryPage = () => {
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        if (e.target.value === "김물주") {
            setSelectedUser({
                name: "김물주",
                email: "mulzu@gmail.com",
                phone: "010-1234-5678",
                orders: 3,
                status: "배송",
                details: [
                    {
                        date: "2025.09.18",
                        start: "서울특별시 강서구 공항대로 200",
                        end: "강원특별자치도 춘천시 동산면 근처리 12",
                        distance: "105KM",
                        type: "목재",
                        amount: "559,000원",
                        owner: "이화주"
                    }
                ],
                history: [
                    { route: "충주", roend: "부산", date: "2025.02.02"},
                    { route: "충주", roend: "부산", date: "2025.02.03"},
                    { route: "충주", roend: "부산", date: "2025.02.04"},
                    { route: "충주", roend: "부산", date: "2025.02.05"},
                    { route: "충주", roend: "부산", date: "2025.02.06"},
                ]
            });
        } else {
            setSelectedUser(null);
        }
    };

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">
                    배송조회
                </Typography>
                <TextField
                    variant="outlined"
                    placeholder="검색"
                    size="small"
                    value={search}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />
                        ),
                    }}
                />
            </Box>

            <Paper variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>이름</TableCell>
                            <TableCell>email</TableCell>
                            <TableCell>전화번호</TableCell>
                            <TableCell>주문수</TableCell>
                            <TableCell>주문현황</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedUser ? (
                            <TableRow>
                                <TableCell>{selectedUser.name}</TableCell>
                                <TableCell>{selectedUser.email}</TableCell>
                                <TableCell>{selectedUser.phone}</TableCell>
                                <TableCell>{selectedUser.orders}</TableCell>
                                <TableCell>
                                    <Chip label={selectedUser.status} color="warning" size="small" />
                                </TableCell>
                                <TableCell>⋯</TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    ...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {selectedUser && (
                <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>출발 날짜</TableCell>
                                <TableCell>출발지</TableCell>
                                <TableCell>도착지</TableCell>
                                <TableCell>거리</TableCell>
                                <TableCell>종류</TableCell>
                                <TableCell>금액</TableCell>
                                <TableCell>화물주</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedUser.details.map((d, i) => (
                                <TableRow key={i}>
                                    <TableCell>{d.date}</TableCell>
                                    <TableCell>{d.start}</TableCell>
                                    <TableCell>{d.end}</TableCell>
                                    <TableCell>{d.distance}</TableCell>
                                    <TableCell>{d.type}</TableCell>
                                    <TableCell>{d.amount}</TableCell>
                                    <TableCell>{d.owner}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {selectedUser && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        지난 배송 내역
                    </Typography>
                    {selectedUser.history.map((h, idx) => (
                        <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography>{h.route}</Typography>
                            <Typography>{h.roend}</Typography>
                            <Typography>{h.date}</Typography>
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
};

export default DeliveryPage;
