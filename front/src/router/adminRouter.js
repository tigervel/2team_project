import { lazy, Suspense } from "react";
import MemberOwner from "../pages/admin/MemberOwner";
import MemberCowner from "../pages/admin/MemberCowner";
import MemberReport from "../pages/admin/MemberReport";
import MemberAdmin from "../pages/admin/MemberAdmin";
import Notice from "../pages/admin/Notice";
import Inquirie from "../pages/admin/Inquirie";
import FeesBasic from "../pages/admin/FeesBasic";
import FeesExtra from "../pages/admin/FeesExtra";

const AdminLayout = lazy(() => import("../layout/AdminLayout"));
const AdminPage = lazy(() => import("../pages/admin/AdminPage"));
const DeliveryPage = lazy(() => import("../pages/admin/DeliveryPage"));
const MemberAll = lazy(() => import("../pages/admin/MemberAll"));

const loading = <div>로딩중입니다.....</div>;

const adminRouter = () => {
    return [
        {
            index: true, // 기본 진입 시 /admin -> AdminPage
            element: <Suspense fallback={loading}><AdminPage /></Suspense>,
        },
        {
            path: "delivery",
            element: <Suspense fallback={loading}><DeliveryPage /></Suspense>,
        },
        {
            path: "memberAll",
            element: <Suspense fallback={loading}><MemberAll /></Suspense>,
        },
        {
            path: "memberOwner",
            element: <Suspense fallback={loading}><MemberOwner /></Suspense>,
        },
        {
            path: "memberCowner",
            element: <Suspense fallback={loading}><MemberCowner /></Suspense>,
        },
        {
            path: "memberReport",
            element: <Suspense fallback={loading}><MemberReport /></Suspense>,
        },
        {
            path: "memberAdmin",
            element: <Suspense fallback={loading}><MemberAdmin /></Suspense>,
        },
        {
            path: "notice",
            element: <Suspense fallback={loading}><Notice /></Suspense>,
        },
        {
            path: "inquirie",
            element: <Suspense fallback={loading}><Inquirie /></Suspense>,
        },
        {
            path: "feesBasic",
            element: <Suspense fallback={loading}><FeesBasic /></Suspense>,
        },
        {
            path: "feesExtra",
            element: <Suspense fallback={loading}><FeesExtra /></Suspense>,
        },
        {
            path: "deliveryPage",
            element: <Suspense fallback={loading}><DeliveryPage /></Suspense>,
        },
    ]
};
export default adminRouter;
