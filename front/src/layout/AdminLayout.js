import { Outlet } from 'react-router-dom';
import { AppProvider } from '@mui/x-teleport';
import adminNavigation from '../navigation/adminNavigation';
import adminTheme from '../theme/adminTheme';

const AdminLayout = () => {
  return (
    <AppProvider
      navigation={adminNavigation}
      theme={adminTheme}
    >
      <Outlet />
    </AppProvider>
  );
};

export default AdminLayout;