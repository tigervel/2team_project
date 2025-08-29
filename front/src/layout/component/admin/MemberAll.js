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
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { fetchMembers } from "../../../api/adminApi/adminMembersApi";

const MemberAll = () => {
    
    const [activeTab, setActiveTab] = useState(0);     // 0=전체, 1=물주, 2=차주, 3=신고내역, 4=관리자
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (location.pathname.includes("/admin/memberOwner")) setActiveTab(1);
      else if (location.pathname.includes("/admin/memberCowner")) setActiveTab(2);
      else if (location.pathname.includes("/admin/memberReport")) setActiveTab(3);
      else if (location.pathname.includes("/admin/memberAdmin")) setActiveTab(4);
      else setActiveTab(0); // Default to "전체 회원"
    }, [location.pathname]);

    const apiType = (() => {
        switch (activeTab) {
            case 1: return "OWNER";
            case 2: return "COWNER";
            case 4: return "ADMIN";
            case 3: return "REPORTED";
            default: return "ALL";
        }
    })();

    const page = currentPage - 1;
    const sort = "memCreateidDateTime,desc";

    useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data = await fetchMembers({
          type: apiType,
          page,
          size: pageSize,
          sort,
          keyword: searchKeyword.trim(),
        });
        const { content = [], totalPages = 1 } = data ?? {};
        setUsers(content.map(toRow));
        setTotalPages(Math.max(totalPages, 1));
      } catch (e) {
        console.error(e);
        setUsers([]); setTotalPages(1);
        setError("목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [apiType, page, pageSize, searchKeyword, sort]);

    const toRow = (u) => ({
        name: u.memName || "",
        email: u.memEmail || "",
        phone: u.memPhone || "",
        leaveDate: (u.memCreateidDateTime || "")
            .toString()
            .replace("T", " ")
            .slice(0, 16),
        OrderNum: "-",
        reports: 0,
    });

    const handleTabChange = (_, v) => {
      setActiveTab(v);
      setCurrentPage(1);
      if (v === 0) navigate("/admin/memberAll");
      else if (v === 1) navigate("/admin/memberOwner");
      else if (v === 2) navigate("/admin/memberCowner");
      else if (v === 3) navigate("/admin/memberReport");
      else if (v === 4) navigate("/admin/memberAdmin");
    };
    const handlePageChange = (_, v) => setCurrentPage(v);
    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={1}>회원 관리</Typography>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="전체 회원" component={NavLink} to="/admin/memberAll" />
            <Tab label="물주" component={NavLink} to="/admin/memberOwner" />
            <Tab label="차주" component={NavLink} to="/admin/memberCowner" />
            <Tab label="신고내역" component={NavLink} to="/admin/memberReport" />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>
        <TextField
          variant="outlined" placeholder="Search" size="small"
          value={searchKeyword} onChange={handleSearchChange}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} /> }}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px"><CircularProgress /></Box>
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
            {users.map((u, i) => (
              <TableRow key={i}>
                <TableCell padding="checkbox"><Checkbox /></TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.leaveDate}</TableCell>
                <TableCell>{u.OrderNum}</TableCell>
                <TableCell><Chip label={`${u.reports}`} size="small" /></TableCell>
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
