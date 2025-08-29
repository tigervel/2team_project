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
import { getPostList } from "../../../api/qaboardApi";

const Inquirie = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const handleTabChange = (e, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (e, value) => setCurrentPage(value);

    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    useEffect(() => {
        const fetchInquiries = async () => {
            if (activeTab === 1) { // Only fetch inquiries when '문의사항' tab is active
                setIsLoading(true);
                try {
                    const response = await getPostList({ page: currentPage - 1, size: 10, keyword: searchKeyword }, {}, true); // isAdmin: true
                    setUsers(response.content.map(post => ({
                        name: post.authorName, // Assuming authorName is available
                        title: post.title,
                        content: post.content, // Or a truncated version
                        userSort: post.authorType, // Assuming authorType is available
                        InquirieDate: new Date(post.createdAt).toLocaleDateString(), // Format date
                        inquirie: post.hasResponse ? "답변완료" : "답변대기", // Check for admin response
                        postId: post.postId // Keep postId for detail view/response
                    })));
                    setTotalPages(response.totalPages);
                } catch (error) {
                    console.error("Failed to fetch inquiries:", error);
                    setUsers([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (activeTab === 0) {
                // TODO: Fetch notices for '공지사항' tab
                setUsers([]); // Clear users if not on inquiries tab
            }
        };

        fetchInquiries();
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
                            <TableCell>이름</TableCell>
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
