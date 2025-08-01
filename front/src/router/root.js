import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import orderRouter from "./orderRouter"
import adminRouter from "./adminRouter"
import mypageRouter from "./mypageRouter"
import servicecenterRouter from "./servicecenterRouter"
import AdminLayout from "../layout/AdminLayout";
import AdminNoticeList from "../pages/AdminNoticeList";
import AdminInquiryList from "../pages/AdminInquiryList";




const Loading = <div>Loading 중....</div>
//컴포넌트가 로딩될때까지 메세지를 출력하도록 설정함..
const MainLayout = lazy(() => import("../layout/MainPageLayout"));
const Login = lazy(() => import("../pages/LoginPage"));
const My = lazy(() => import("../pages/MyPage"));
const Home = lazy(() => import("../pages/HomePage"))
const Admin = lazy(() => import("../pages/AdminPage"));
const Order = lazy(() => import("../pages/OrderPage"));
<<<<<<< HEAD
const ServiceCenter =lazy(() => import("../pages/ServiceCenterPage"));
const MyPageLayout = lazy(() => import("../layout/MyPageLayout"));

=======
const ServiceCenter = lazy(() => import("../pages/ServiceCenterPage"));
>>>>>>> 2bcb5e9d3bf608f2535a2b89ae6d8ef87139376c
const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><MainLayout /></Suspense>,
        children: [
            {
                index: true,
                element: <Suspense fallback={Loading}><Home /></Suspense>
            },
            {
<<<<<<< HEAD
                path: "login",
                element: <Suspense fallback={Loading}><Login /></Suspense>
            },
=======
                path: "mypage",
                element: <Suspense fallback={Loading}><My /></Suspense>
            },
            {
                path: "login",
                element: <Suspense fallback={Loading}><Login /></Suspense>
            },

>>>>>>> 2bcb5e9d3bf608f2535a2b89ae6d8ef87139376c
            {
                path: "adminpage",
                element: <Suspense fallback={Loading}><Admin /></Suspense>,
            },
            {
                path: "orderpage",
                element: <Suspense fallback={Loading}><Order /></Suspense>,
            },
            {
                path: "servicecenterpage",
                element: <Suspense fallback={Loading}><ServiceCenter /></Suspense>,
<<<<<<< HEAD
=======
                //children: servicecenterRouter()
            },
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    { path: 'notice', element: <AdminNoticeList /> },
                    { path: 'inquiry', element: <AdminInquiryList /> },
                ]
>>>>>>> 2bcb5e9d3bf608f2535a2b89ae6d8ef87139376c
            }
        ]
    },
    {
        path: "mypage",
        element: <Suspense fallback={Loading}><MyPageLayout /></Suspense>,
        children: mypageRouter
    }
]);

export default root;