// 신고내역 페이지
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Button,
  Switch,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {
  fetchReports,
  fetchUnreadCount,
  markReportRead,
} from "../../../api/adminApi/adminReportsApi";

const MemberReport = () => {
  const [activeTab, setActiveTab] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (location.pathname.endsWith("/admin/memberReport")) setActiveTab(3);
    else if (location.pathname.endsWith("/admin/memberAll")) setActiveTab(0);
    else if (location.pathname.endsWith("/admin/memberOwner")) setActiveTab(1);
    else if (location.pathname.endsWith("/admin/memberCowner")) setActiveTab(2);
    else if (location.pathname.endsWith("/admin/memberAdmin")) setActiveTab(4);
  }, [location.pathname]);

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
  };

  const fmtDate = (dt) =>
    dt ? dt.toString().replace("T", " ").slice(0, 16) : "";

  const loadUnreadCount = async () => {
    try {
      const n = await fetchUnreadCount();
      setUnreadCount(n || 0);
    } catch (e) {
      console.warn("unread-count fetch failed", e);
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReports({
        unreadOnly,
        keyword,
        page: page - 1,
        size,
        sort: "createdAt,desc",
      });
      setRows(data.content ?? []);
      setTotalPages(Math.max(data.totalPages || 1, 1));
    } catch (e) {
      console.error(e);
      setError("신고 목록을 불러오지 못했습니다.");
      setRows([]); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    load();
  }, [page, size, keyword, unreadOnly]);

  const onToggleRead = async (id, currentRead) => {
    try {
      await markReportRead(id, !currentRead);
      await Promise.all([load(), loadUnreadCount()]);
    } catch (e) {
      console.error(e);
      alert("상태 변경 실패");
    }
  };

  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            회원 관리
          </Typography>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="전체 회원" onClick={() => navigate("/admin/memberAll")} />
            <Tab label="물주" onClick={() => navigate("/admin/memberOwner")} />
            <Tab label="차주" onClick={() => navigate("/admin/memberCowner")} />
            <Tab
              label={unreadCount > 0 ? `신고내역 (${unreadCount})` : "신고내역"}
              onClick={() => navigate("/admin/memberReport")}
            />
            <Tab label="관리자" onClick={() => navigate("/admin/memberAdmin")} />
          </Tabs>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">미확인만</Typography>
            <Switch
              checked={unreadOnly}
              onChange={(e) => { setPage(1); setUnreadOnly(e.target.checked); }}
            />
          </Stack>

          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            value={keyword}
            onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
            }}
          />
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox /></TableCell>
              <TableCell>신고대상</TableCell>
              <TableCell>신고자</TableCell>
              <TableCell>신고일</TableCell>
              <TableCell>사유</TableCell>
              <TableCell>처리상태</TableCell>
              <TableCell>읽음</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id ?? i}>
                <TableCell padding="checkbox"><Checkbox /></TableCell>
                <TableCell>{r.targetId ?? "-"}</TableCell>
                <TableCell>{r.reporterId ?? "-"}</TableCell>
                <TableCell>{fmtDate(r.createdAt)}</TableCell>
                <TableCell>{r.content ?? "-"}</TableCell>
                <TableCell>
                  <Chip
                    label={r.adminRead ? "처리됨" : "미확인"}
                    color={r.adminRead ? "default" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {r.adminRead ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onToggleRead(r.id, !!r.adminRead)}
                    >
                      미확인으로 변경
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() => onToggleRead(r.id, !!r.adminRead)}
                    >
                      확인
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.max(totalPages, 1)}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default MemberReport;
