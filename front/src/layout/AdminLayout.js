import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <List>
          <ListItem button component={Link} to="/admin/dashboard">
            <ListItemText primary="이용통계" />
          </ListItem>
        </List>
        <List>
          <ListItem button component={Link} to="/admin/Shipping">
            <ListItemText primary="배송조회" />
          </ListItem>
        </List>
        <List>
          <ListItem button component={Link} to="/admin/notice">
            <ListItemText primary="공지사항" />
          </ListItem>
          <ListItem button component={Link} to="/admin/inquiry">
            <ListItemText primary="문의사항" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;