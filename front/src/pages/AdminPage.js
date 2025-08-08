import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";
import AdminSidebar from "../common/AdminSidebar";

const AdminPage = () => (
  <Box sx={{ display: "flex", height: "100vh" }}>
    <AdminSidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f3f4f6", overflow: "auto" }}>
      <Outlet />
    </Box>
  </Box>
);

export default AdminPage;
