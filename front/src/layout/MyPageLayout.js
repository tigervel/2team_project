import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import { Toolbar } from "@mui/material";
import ResponsiveAppBar from "../common/ResponsiveAppBar";
import Sidebar from "../common/Sidebar";

const MyPageLayout = () => {
    // MyPage.js에 있던 ownerId를 이곳으로 이동하거나,
    // 상위 컴포넌트 또는 전역 상태 관리(Redux 등)를 통해 받아와야 합니다.
    // 지금은 예시로 1을 사용합니다.
    const ownerId = 1; 

    return (
        <Box sx={{ display: 'flex' }}>
            <ResponsiveAppBar />
            <Sidebar ownerId={ownerId} />
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MyPageLayout;
