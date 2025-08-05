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

const Inquirie = () => {
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
                        name: "화주3",
                        title: "문의 제목1",
                        content: "문의 내용1",
                        userSort: "물주",
                        InquirieDate: "2025.08.01",
                        inquirie: "답변대기"
                    },
                    {
                        name: "화주3",
                        title: "문의 제목2",
                        content: "문의 내용2",
                        userSort: "물주",
                        InquirieDate: "2025.08.01",
                        inquirie: "답변대기"
                    },
                    {
                        name: "화주3",
                        title: "문의 제목3",
                        content: "문의 내용3",
                        userSort: "물주",
                        InquirieDate: "2025.08.01",
                        inquirie: "답변완료"
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
                        공지/문의
                    </Typography>
                    <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="공지사항" />
                        <Tab label="문의사항" />
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
                            <TableCell>사용자ID</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>내용</TableCell>
                            <TableCell>사용자구분</TableCell>
                            <TableCell>작성일</TableCell>
                            <TableCell>답변 여부</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={idx}>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.title}</TableCell>
                                <TableCell>{user.content}</TableCell>
                                <TableCell>{user.userSort}</TableCell>
                                <TableCell>{user.InquirieDate}</TableCell>
                                <TableCell>
                                    <Chip label={`${user.inquirie}`} color={user.inquirie ? "warning" : "default"} size="small" />
                                </TableCell>
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

export default Inquirie;
