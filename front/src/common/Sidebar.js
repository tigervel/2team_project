import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Box,
  Toolbar
} from '@mui/material';
import { NavLink } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

const drawerWidth = 240;

const Sidebar = ({ ownerId }) => {
  const navStyle = {
    textDecoration: 'none',
    color: 'inherit',
  };

  const activeStyle = {
    backgroundColor: '#e0e0e0',
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', pt: 4 },
      }}
    >
      <Toolbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          마이페이지
        </Typography>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.200', color: 'grey.500' }}>
          <PersonIcon />
        </Avatar>
      </Box>

      <Divider />

      <List>
        <NavLink to="/mypage" end style={navStyle}>
          {({ isActive }) => (
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="내 정보" />
            </ListItem>
          )}
        </NavLink>

        <NavLink to="/mypage/delivery" style={navStyle}>
          {({ isActive }) => (
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="배송 정보 관리" />
            </ListItem>
          )}
        </NavLink>

        <NavLink to="/mypage/edit" style={navStyle}>
          {({ isActive }) => (
            <ListItem button sx={isActive ? activeStyle : null}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="회원 정보 수정" />
            </ListItem>
          )}
        </NavLink>

        {ownerId !== null && (
          <NavLink to="/mypage/vehicle" style={navStyle}>
            {({ isActive }) => (
              <ListItem button sx={isActive ? activeStyle : null}>
                <ListItemIcon>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText primary="내 차량 관리" />
              </ListItem>
            )}
          </NavLink>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;