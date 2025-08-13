import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,            // ADDED
  IconButton,            // ADDED
  Stack                  // ADDED
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // ADDED
// REMOVED: import { API_SERVER_HOST } from "../../../api/serverConfig";
import {
  fetchFeesBasic,
  saveFeeBasicCell,
  // ADDED ↓ 행 목록/추가/삭제 API
  getBasicRows,
  addBasicRow,
  deleteBasicRow,
} from "../../../api/adminApi/adminApi"; // CHANGED: import 정리

const FeesBasic = () => {
  // REMOVED: Tabs/Pagination/Search 등 사용안함
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          기본요금
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <FeesBasicTable />
      )}
    </Box>
  );
};

const FeesBasicTable = () => {
  // CHANGED: 고정 rows/columns → 상수 columns + 서버 rows
  const COLUMNS = ["거리별 요금", "기본 요금"]; // 유지
  const [rows, setRows] = useState([]); // ADDED: 서버에서 오는 행 라벨(중량)
  const [tableData, setTableData] = useState([]); // CHANGED: 서버 그리드
  const [newRow, setNewRow] = useState(""); // ADDED: 행 추가 입력

  const fetchRows = useCallback(async () => {
    const res = await getBasicRows();
    setRows(res.data || []);
  }, []);

  const fetchGrid = useCallback(async () => {
    const res = await fetchFeesBasic();
    setTableData(Array.isArray(res.data) ? res.data : []);
  }, []);

  useEffect(() => {
    (async () => {
      await fetchRows();
      await fetchGrid();
    })();
  }, [fetchRows, fetchGrid]);

  const handleChange = (r, c, v) => {
    setTableData(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = v;
      return next;
    });
  };

  const handleSave = async (rowIdx, colIdx) => {
    try {
      await saveFeeBasicCell({
        category: rows[rowIdx],           // CHANGED: 서버 행 라벨 사용
        distance: COLUMNS[colIdx],
        price: Number(tableData[rowIdx]?.[colIdx] || 0),
      });
      await fetchGrid(); // 저장 후 재조회
      alert("저장 성공");
    } catch (e) {
      console.error("[BASIC] Save failed", e?.response?.status, e?.response?.data || e.message);
      alert("저장 실패");
    }
  };

  const onAddRow = async () => {
    const name = newRow.trim();
    if (!name) return;
    try {
      await addBasicRow(name);
      setNewRow("");
      await Promise.all([fetchRows(), fetchGrid()]);
    } catch (e) {
      console.error(e);
      alert("행 추가 실패");
    }
  };

  const onDeleteRow = async (name) => {
    if (!window.confirm(`'${name}' 행을 삭제할까요?`)) return;
    try {
      await deleteBasicRow(name);
      await Promise.all([fetchRows(), fetchGrid()]);
    } catch (e) {
      console.error(e);
      alert("행 삭제 실패");
    }
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="새 중량 (예: 7톤)"
          value={newRow}
          onChange={(e) => setNewRow(e.target.value)}
          sx={{ width: 200 }}
        />
        <Button variant="contained" onClick={onAddRow}>행 추가</Button>
      </Stack>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={thStyle}>중량(톤수)</th>
            {COLUMNS.map((col, idx) => (
              <th key={idx} style={thStyle}>{col}</th>
            ))}
            <th style={thStyle}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rowLabel, rowIdx) => (
            <tr key={rowLabel}>
              <th style={thStyle}>{rowLabel}</th>
              {COLUMNS.map((_, colIdx) => (
                <td key={`${rowLabel}-${colIdx}`} style={tdStyle}>
                  <input
                    type="text"
                    value={tableData[rowIdx]?.[colIdx] ?? ""}
                    onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                    style={inputStyle}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSave(rowIdx, colIdx)}
                    style={{ marginLeft: 8 }}
                  >
                    저장
                  </Button>
                </td>
              ))}
              <td style={tdStyle}>
                <IconButton color="error" onClick={() => onDeleteRow(rowLabel)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 2} style={tdStyle}>행이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
  backgroundColor: "#f5f5f5",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "4px",
  textAlign: "center",
};

const inputStyle = {
  width: "100px",
  textAlign: "center",
  padding: "4px",
  border: "1px solid #ddd",
  borderRadius: "4px",
};

export default FeesBasic;