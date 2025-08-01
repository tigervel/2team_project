// components/admin/AdminSidebar.js
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  HelpOutline as HelpIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const navLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
};

const activeStyle = {
  backgroundColor: '#e0e0e0',
};

export default function AdminSidebar() {
  const [openMember, setOpenMember] = useState(false);
  const [openNotice, setOpenNotice] = useState(false);
  const [openShipping, setOpenShipping] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          paddingTop: '64px', // AppBar 높이 고려
        },
      }}
    >
      <List>
        {/* 회원관리 */}
        <ListItemButton onClick={() => setOpenMember(!openMember)}>
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="회원관리" />
          {openMember ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMember} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink to="/admin/members" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="전체 회원" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
        </Collapse>

        {/* 공지/문의 */}
        <ListItemButton onClick={() => setOpenNotice(!openNotice)}>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary="공지 / 문의" />
          {openNotice ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openNotice} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink to="/admin/notice" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="공지사항" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/admin/inquiry" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="문의사항" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
        </Collapse>

        {/* 운송료 설정 */}
        <ListItemButton onClick={() => setOpenShipping(!openShipping)}>
          <ListItemIcon>
            <ShippingIcon />
          </ListItemIcon>
          <ListItemText primary="운송료 설정" />
          {openShipping ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openShipping} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink to="/admin/defaultCost" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="기본요금" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/admin/addCost" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="추가요금" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/admin/addCost" style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={{ pl: 4 }} selected={isActive}>
                  <ListItemText primary="추가요금" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
