import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    TextField,
    Pagination,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const FeesBasic = () => {
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
                <Box>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                        운송료
                    </Typography>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab label="기본요금" />
                        <Tab label="추가요금" />
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
                <FeesBasicTable />
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={11} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
        </Box>
    );
};

const FeesBasicTable = () => {
    const rows = ["0.5톤", "1톤", "2톤", "3톤", "4톤", "5톤이상"];
    const columns = ["거리1", "거리2", "거리3", "거리4", "거리5", "거리6"];

    const [tableData, setTableData] = useState(
        Array(rows.length).fill(0).map(() => Array(columns.length).fill(""))
    );

    const handleChange = (rowIdx, colIdx, value) => {
        const updatedData = [...tableData];
        updatedData[rowIdx][colIdx] = value;
        setTableData(updatedData);
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

const buttonStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
};

export default FeesBasic;
