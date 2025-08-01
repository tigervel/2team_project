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
const ServiceCenter = lazy(() => import("../pages/ServiceCenterPage"));
const root = createBrowserRouter([
    //내부에는 객체 형태로 요청에 따른 페이지 설정을 잡아줍니다
    //
    {
        path: "",
        //지연 로딩을 수행하는 컴포넌트 suspense
        element: <Suspense fallback={Loading}><MainLayout /></Suspense>,
        children: [
            {
                index: true,
                element: <Suspense fallback={Loading}><Home /></Suspense>
            },
            {
                path: "mypage",
                element: <Suspense fallback={Loading}><My /></Suspense>
            },
            {
                path: "login",
                element: <Suspense fallback={Loading}><Login /></Suspense>
            },

            {
                path: "adminpage",
                element: <Suspense fallback={Loading}><Admin /></Suspense>,
                //children: adminRouter()
            },
            {
                path: "orderpage",
                element: <Suspense fallback={Loading}><Order /></Suspense>,
                //children: orderRouter()
            },
            {
                path: "servicecenterpage",
                element: <Suspense fallback={Loading}><ServiceCenter /></Suspense>,
                //children: servicecenterRouter()
            },
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    { path: 'notice', element: <AdminNoticeList /> },
                    { path: 'inquiry', element: <AdminInquiryList /> },
                ]
            }


        ]

    }







]);

export default root;