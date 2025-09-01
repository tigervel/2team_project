import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Pagination, CircularProgress, TextField, Tabs, Tab,
  TableContainer, Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { fetchMembers } from "../../../api/adminApi/adminMembersApi";

const MemberCowner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  

  const [activeTab, setActiveTab] = useState(2);

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  const sort = useMemo(() => "memCreateidDateTime,desc", []);

  useEffect(() => {
    if (location.pathname.includes("/admin/memberOwner")) setActiveTab(1);
    else if (location.pathname.includes("/admin/memberCowner")) setActiveTab(2);
    else if (location.pathname.includes("/admin/memberReport")) setActiveTab(3);
    else if (location.pathname.includes("/admin/memberAdmin")) setActiveTab(4);
    else setActiveTab(0); // Default to "전체 회원"
  }, [location.pathname]);

  

  const handleTabChange = (_e, v) => {
    setActiveTab(v);
    setPage(1); // Reset page when changing tabs
    if (v === 0) navigate("/admin/memberAll");
    else if (v === 1) navigate("/admin/memberOwner");
    else if (v === 2) navigate("/admin/memberCowner");
    else if (v === 3) navigate("/admin/memberReport");
    else if (v === 4) navigate("/admin/memberAdmin");
  };

  const handleSearchChange = (e) => setKeyword(e.target.value);

  const fmt = (dt) => (dt ? dt.toString().replace("T", " ").slice(0, 16) : "");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchMembers({
        type: "COWNER",
        page: page - 1,
        size,
        sort,
        keyword: keyword?.trim() || undefined,
      });
      setRows(data.content ?? []);
      setTotalPages(Math.max(data.totalPages || 1, 1));
    } catch (e) {
      console.error(e);
      setError("차주 목록을 불러오지 못했습니다.");
      setRows([]); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();}, [page, keyword, sort]);

  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={1}>차주</Typography>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="전체 회원" component={NavLink} to="/admin/memberAll" />
            <Tab label="물주" component={NavLink} to="/admin/memberOwner" />
            <Tab label="차주" component={NavLink} to="/admin/memberCowner" />
            <Tab label="신고내역" component={NavLink} to="/admin/memberReport" />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>
        <TextField
          variant="outlined"
          placeholder="Search"
          size="small"
          value={keyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
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
              {rows.map((u, i) => (
                <TableRow key={i}>
                  <TableCell>{u.memName}</TableCell>
                  <TableCell>{u.memEmail}</TableCell>
                  <TableCell>{u.memPhone}</TableCell>
                  <TableCell>{fmt(u.memCreateidDateTime)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Chip label="0" size="small" /></TableCell>
                  <TableCell>⋯</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">데이터가 없습니다</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>
    </Box>
  );
};

export default MemberCowner;
