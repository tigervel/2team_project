import { Routes, Route } from 'react-router-dom';
import AdminNoticeList from '../pages/AdminNoticeList';
import AdminInquiryList from '../pages/AdminInquiryList';
import AdminLayout from '../layout/AdminLayout';

const AdminRoutes = () => {
  return (
    <Routes>
      <Routes>
        <Route path="admin" element={<AdminLayout />}>
          <Route path="notice" element={<AdminNoticeList />} />
          <Route path="inquiry" element={<AdminInquiryList />} />
        </Route>
      </Routes>
    </Routes>
  );
};

export default AdminRoutes;