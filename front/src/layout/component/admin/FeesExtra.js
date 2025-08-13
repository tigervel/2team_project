import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    TextField,
    Pagination,
    CircularProgress,
    Button,
} from "@mui/material";
import axios from "axios";
import { API_SERVER_HOST } from "../../../api/serverConfig";
import { fetchFeesExtra, saveFeeCell, saveFeeExtraCell } from "../../../api/adminApi/adminApi";

const FeesExtra = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTabChange = (e, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (e, value) => setCurrentPage(value);

    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    }, [currentPage, activeTab, searchKeyword]);

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                < Typography variant="h4" fontWeight="bold" gutterBottom>
                    추가요금
                </Typography >
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                </Box>
            ) : (
                <FeesExtraTable activeTab={activeTab} />
            )}
        </Box>
    );
};

const FeesExtraTable = () => {
    const rows = ["냉동식품", "유제품", "위험물", "파손주의"];
    const columns = ["추가요금"];
    const [tableData, setTableData] = useState(
        Array(rows.length).fill(0).map(() => Array(columns.length).fill(""))
    );

    const type = "extra";

    const fetchGrid = useCallback(async () => {
        try {
            const res = await fetchFeesExtra();
            setTableData(Array.isArray(res.data) ? res.data : tableData);
        } catch (e) {
            console.error("[EXTRA] Fetch failed", e?.response?.status, e?.response?.data || e.message);
        }
    }, []);

    useEffect(() => { fetchGrid(); }, [fetchGrid]);

    const handleChange = (r, c, v) => {
        const next = tableData.map(row => [...row]);
        next[r][c] = v;
        setTableData(next);
    };

    const handleSave = async (rowIdx, colIdx) => {
        try {
            await saveFeeExtraCell({
                type,
                category: rows[rowIdx],
                distance: columns[colIdx],
                price: Number(tableData[rowIdx][colIdx] || 0),
            });
            await fetchGrid();
            alert("저장 성공");
        } catch (e) {
            console.error("[EXTRA] Save failed", e?.response?.status, e?.response?.data || e.message);
            alert("저장 실패");
        }
    };

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={thStyle}> </th>
                        {columns.map((col, idx) => (
                            <th key={idx} style={thStyle}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((rowLabel, rowIdx) => (
                        <tr key={rowIdx}>
                            <th style={thStyle}>{rowLabel}</th>
                            {columns.map((_, colIdx) => (
                                <td key={colIdx} style={tdStyle}>
                                    <input
                                        type="text"
                                        value={tableData[rowIdx][colIdx]}
                                        onChange={(e) =>
                                            handleChange(rowIdx, colIdx, e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleSave(rowIdx, colIdx)}
                                        style={{ marginTop: "16px" }}
                                    >
                                        저장
                                    </Button>
                                </td>
                            ))}
                        </tr>
                    ))}
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
    width: "60px",
    textAlign: "center",
    padding: "4px",
    border: "1px solid #ddd",
    borderRadius: "4px",
};

export default FeesExtra;
