//차주 페이지
import React, { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Checkbox, Chip, Pagination, CircularProgress, TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { API_SERVER_HOST } from "../../../api/serverConfig";

const prefix = `${API_SERVER_HOST}/api/admin/users`;

const MemberCowner = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const page = currentPage - 1;

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await axios.get(`${prefix}/Cowners`, {
                    params: { page, size: pageSize, sort: "cargoCreateidDateTime,desc" }
                });
                const { content = [], totalPages = 1 } = res.data ?? {};
                setRows(
                    content.map(u => ({
                        name: u.cargoName,
                        email: u.cargoEmail,
                        phone: u.cargoPhone,
                        createdAt: (u.cargoCreateidDateTime || "").toString().replace("T", " ").slice(0, 16),
                        orderNum: "-",
                        reports: 0
                    }))
                );
                setTotalPages(Math.max(totalPages, 1));
            } catch (e) {
                console.error(e);
                setError("차주 목록을 불러오지 못했습니다.");
                setRows([]); setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [page, pageSize]);

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">차주 목록</Typography>
                <TextField
                    variant="outlined" size="small" placeholder="Search"
                    value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} /> }}
                />
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}><CircularProgress /></Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"><Checkbox /></TableCell>
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
                        {rows.map((r, i) => (
                            <TableRow key={i}>
                                <TableCell padding="checkbox"><Checkbox /></TableCell>
                                <TableCell>{r.name}</TableCell>
                                <TableCell>{r.email}</TableCell>
                                <TableCell>{r.phone}</TableCell>
                                <TableCell>{r.memCreateIdDateTime}</TableCell>
                                <TableCell>{r.orderNum}</TableCell>
                                <TableCell><Chip label={`${r.reports}`} color={r.reports ? "warning" : "default"} size="small" /></TableCell>
                                <TableCell>⋯</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={Math.max(totalPages, 1)} page={currentPage} onChange={(_, v) => setCurrentPage(v)} color="primary" />
            </Box>
        </Box>
    );
};

export default MemberCowner;
