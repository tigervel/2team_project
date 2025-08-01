import { Outlet } from "react-router-dom";
import AdminSidebar from "../common/AdminSidebar";

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ flexGrow: 1, padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
