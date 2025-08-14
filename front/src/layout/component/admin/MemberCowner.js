import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, Chip, Pagination, CircularProgress, TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchMembers } from "../../../api/adminApi/adminMembersApi";

const MemberCowner = () => {
  const [page, setPage] = useState(1);       // UI용 1-base
  const [size] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchMembers({
        type: "COWNER",
        page: page - 1, size,
        sort: "memCreateidDateTime,desc",
        keyword
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

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, size]);
  // 검색 즉시 반영하려면 아래처럼:
  // useEffect(() => { setPage(1); load(); }, [keyword]);

  const fmt = (dt) => (dt ? dt.toString().replace("T", " ").slice(0,16) : "");

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">차주 목록</Typography>
        <TextField
          size="small" placeholder="Search"
          value={keyword} onChange={(e)=>setKeyword(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr:1, color:"grey.500" }}/> }}
          onKeyDown={(e)=>{ if(e.key==='Enter'){ setPage(1); load(); }}}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}><CircularProgress/></Box>
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
            {rows.map((u, i)=>(
              <TableRow key={i}>
                <TableCell padding="checkbox"><Checkbox/></TableCell>
                <TableCell>{u.memName}</TableCell>
                <TableCell>{u.memEmail}</TableCell>
                <TableCell>{u.memPhone}</TableCell>
                <TableCell>{fmt(u.memCreateidDateTime)}</TableCell>
                <TableCell>-</TableCell>
                <TableCell><Chip label="0" size="small"/></TableCell>
                <TableCell>⋯</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(_,v)=>setPage(v)} color="primary"/>
      </Box>
    </Box>
  );
};

export default MemberCowner;
