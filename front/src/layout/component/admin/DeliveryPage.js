import React, { useState } from "react";
import {
    Box, Typography, Tabs, Tab, TextField,
    Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchUserForDeliveryPage } from "../../../api/adminApi/adminDeliveryApi";

const DeliveryPage = () => {
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [noResults, setNoResults] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearch(query);
        setNoResults(false);
        setSelectedUser(null);

        if (!query) {
            setUserList([]);
            return;
        }

        try {
            const users = await searchUserForDeliveryPage(query);
            setUserList(users);
            if (users.length === 0) {
                setNoResults(true);
            }
        } catch (error) {
            console.error("Error searching user:", error);
            setUserList([]);
            setNoResults(true);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
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
                        {userList.length > 0 ? (
                            userList.map((user) => (
                                <TableRow key={user.email} onClick={() => handleUserSelect(user)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{user.orders}</TableCell>
                                    <TableCell>
                                        <Chip label={user.status} color="warning" size="small" />
                                    </TableCell>
                                    <TableCell>⋯</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    {noResults ? "검색 결과가 없습니다." : "검색어를 입력하세요."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {selectedUser && selectedUser.details && (
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

            {selectedUser && selectedUser.history && (
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
