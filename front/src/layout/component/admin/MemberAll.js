import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox,
    Chip,
    Pagination,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { API_SERVER_HOST } from "../../../api/serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/admin/users`;

const MemberAll = () => {
    const [activeTab, setActiveTab] = useState(0);     // 0=전체, 1=물주, 2=차주, 3=신고내역(아직 구현 x), 4=관리자
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const page = currentPage - 1;

    const apiType = (() => {
        switch (activeTab) {
            case 1: return "OWNER";
            case 2: return "COWNER";
            case 4: return "ADMIN";
            // case 3: return "REPORTED";
            default: return "ALL";
        }
    })();

    const sort = "memCreateidDateTime,desc";

    useEffect(() => {
        const fetchList = async () => {
            setIsLoading(true);
            setError("");
            try {
                const params = {
                    type: apiType,
                    page,
                    size: pageSize,
                    sort,
                };
                if (searchKeyword && searchKeyword.trim()) {
                    params.keyword = searchKeyword.trim();
                }

                const res = await axios.get(prefix, { params });
                console.log("[/g2i4/admin/members] params:", params, "res:", res.data);
                const { content = [], totalPages = 1 } = res.data ?? {};
                setUsers(content.map(toRow));
                setTotalPages(Math.max(totalPages, 1));
            } catch (e) {
                console.error(e);
                setUsers([]);
                setTotalPages(1);
                setError("목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchList();
    }, [apiType, page, pageSize, searchKeyword, sort]);

    // AdminMemberDTO: { type, memId, memName, memEmail, memPhone, memAdress, memCreateidDateTime }
    const toRow = (u) => ({
        name: u.memName || "",
        email: u.memEmail || "",
        phone: u.memPhone || "",
        leaveDate: (u.memCreateidDateTime || "")
            .toString()
            .replace("T", " ")
            .slice(0, 16),
        OrderNum: "-", // 임시(백엔드 x)
        reports: 0,    // 임시(백엔드 x)
    });

    const handleTabChange = (_, v) => { setActiveTab(v); setCurrentPage(1); };
    const handlePageChange = (_, v) => setCurrentPage(v);
    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                        회원 관리
                    </Typography>
                    <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="전체 회원" />
                        <Tab label="물주" />
                        <Tab label="차주" />
                        <Tab label="신고내역" />
                        <Tab label="관리자" />
                    </Tabs>
                </Box>
                <TextField
                    variant="outlined"
                    placeholder="Search"
                    size="small"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
                    }}
                />
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox />
                            </TableCell>
                            <TableCell>이름</TableCell>
                            <TableCell>email</TableCell>
                            <TableCell>전화번호</TableCell>
                            <TableCell>등록일</TableCell>
                            <TableCell>거래수</TableCell>
                            <TableCell>신고내역</TableCell>
                            <TableCell>⋯</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={idx}>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.leaveDate}</TableCell>
                                <TableCell>{user.OrderNum}</TableCell>
                                <TableCell>
                                    <Chip label={`${user.reports}`} color={user.reports ? "warning" : "default"} size="small" />
                                </TableCell>
                                <TableCell>⋯</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={Math.max(totalPages, 1)} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
        </Box>
    );
};

export default MemberAll;
