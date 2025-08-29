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
import { getNoticeList } from "../../../api/noticeApi";

const Notice = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const handlePageChange = (e, value) => setCurrentPage(value);

    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    useEffect(() => {
        const fetchNotices = async () => {
            setIsLoading(true);
            try {
                const response = await getNoticeList({ page: currentPage - 1, size: 10, keyword: searchKeyword });
                setUsers(response.content.map(notice => ({
                    adminId: notice.authorId,
                    title: notice.title,
                    content: notice.content,
                    noticeDate: new Date(notice.createdAt).toLocaleDateString(),
                    noticeId: notice.noticeId
                })));
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Failed to fetch notices:", error);
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotices();
    }, [currentPage, searchKeyword]);

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                        공지/문의
                    </Typography>
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
                            <TableCell>관리자ID</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>내용</TableCell>
                            <TableCell>작성일</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={idx}>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>{user.adminId}</TableCell>
                                <TableCell>{user.title}</TableCell>
                                <TableCell>{user.content}</TableCell>
                                <TableCell>{user.noticeDate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
        </Box>
    );
};

export default Notice;
