//물주 페이지
import React, { useState, useEffect } from "react";
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

const MemberAdmin = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTabChange = (e, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (e, value) => setCurrentPage(value);

    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setUsers([
                    {
                        name: "관리자1",
                        adminId: "Liza1",
                        phone: "010-1234-5678",
                        leaveDate: "2025.08.01",
                    },
                    {
                        name: "관리자2",
                        adminId: "Liza1",
                        phone: "010-1234-5678",
                        leaveDate: "2025.08.01",
                    },
                    {
                        name: "관리자3",
                        adminId: "Liza1",
                        phone: "010-1234-5678",
                        leaveDate: "2025.08.01",
                    },
                ]);
                setIsLoading(false);
            }, 500);
        };

        fetchUsers();
    }, [currentPage, activeTab, searchKeyword]);

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
            ) : (
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox />
                            </TableCell>
                            <TableCell>이름</TableCell>
                            <TableCell>관리자ID</TableCell>
                            <TableCell>전화번호</TableCell>
                            <TableCell>등록일</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={idx}>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.adminId}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.leaveDate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={11} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
        </Box>
    );
};

export default MemberAdmin;
