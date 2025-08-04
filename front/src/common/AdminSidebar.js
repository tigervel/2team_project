import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  Box,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 260;

const AdminSidebar = () => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const handleToggle = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const groups = [
    {
      title: "이용 통계",
      icon: <DashboardIcon />,
      path: "/admin"
    },
    { title: "배송 조회", icon: <DashboardIcon />, path: "/admin/deliveryPage" },
    {
      title: "회원 관리",
      icon: <PeopleIcon />,
      items: [
        { label: "전체 회원", path: "/admin/memberAll" },
        { label: "물주", path: "/admin/memberOwner" },
        { label: "차주", path: "/admin/memberCowner" },
        { label: "신고내역", path: "/admin/memberReport" },
        { label: "관리자", path: "/admin/memberAdmin" },
      ],
    },
    {
      title: "공지/문의",
      icon: <NotificationsIcon />,
      items: [
        { label: "공지사항", path: "/admin/notice" },
        { label: "문의사항", path: "/admin/inquirie" },
      ],
    },
    {
      title: "운송료",
      icon: <MoneyIcon />,
      items: [
        { label: "기본요금", path: "/admin/feesBasic" },
        { label: "추가요금", path: "/admin/feesExtra" },
      ],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f9fafb",
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          관리자 페이지
        </Typography>
        <Avatar
          sx={{
            bgcolor: "#e5e7eb",
            width: 56,
            height: 56,
            margin: "0 auto",
            mb: 2,
          }}
        >
          <PersonIcon sx={{ color: "#9ca3af", fontSize: 32 }} />
        </Avatar>
      </Box>

      <List disablePadding>
        {groups.map((group) =>
          group.items ? (
            <Box key={group.title}>
              <ListItemButton onClick={() => handleToggle(group.title)}>
                {group.icon && <ListItemIcon>{group.icon}</ListItemIcon>}
                <ListItemText primary={group.title} />
                {openGroups[group.title] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openGroups[group.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <ListItemButton
                        key={item.label}
                        component={Link}
                        to={item.path}
                        selected={active}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: active ? 700 : 400,
                            color: active ? "primary.main" : "text.primary",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItemButton
              key={group.title}
              component={Link}
              to={group.path}
              selected={location.pathname === group.path}
            >
              {group.icon && <ListItemIcon>{group.icon}</ListItemIcon>}
              <ListItemText
                primary={group.title}
                primaryTypographyProps={{
                  fontWeight: location.pathname === group.path ? 700 : 400,
                  color: location.pathname === group.path ? "primary.main" : "text.primary",
                }}
              />
            </ListItemButton>
          )
        )}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
