import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";


import mypageRouter from "./mypageRouter"
import servicecenterRouter from "./servicecenterRouter"


import adminRouter from "./adminRouter";
import SignUpPage from "../pages/SignUpPage";
import estimateRouter from "./estimateRouter";
import orderRouter from "./orderRouter";



const Loading = <div>Loading 중....</div>
//컴포넌트가 로딩될때까지 메세지를 출력하도록 설정함..
const MainLayout = lazy(() => import("../layout/MainPageLayout"));
const Login = lazy(() => import("../pages/LoginPage"));

const Home = lazy(() => import("../pages/HomePage"))
const Admin = lazy(() => import("../pages/AdminPage"));
const Estimate = lazy(() => import("../pages/EstimatePage"));


const MyPageLayout = lazy(() => import("../layout/MyPageLayout"));

const Order = lazy(() => import("../pages/OrderPage"));
const ServiceCenter = lazy(() => import("../pages/ServiceCenterPage"));

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

                path: "login",
                element: <Suspense fallback={Loading}><Login /></Suspense>
            },

     
            {
                path: "estimatepage",
                element: <Suspense fallback={Loading}><Estimate /></Suspense>,
                children:estimateRouter.children
            },
            {
                path: "servicecenterpage",
                element: <Suspense fallback={Loading}><ServiceCenter /></Suspense>,

                //children: servicecenterRouter()
            },
              {
                path: "order",
                element: <Suspense fallback={Loading}><Order /></Suspense>,
                children: orderRouter.children
            },

        ]
    },
    {
        path: "mypage",
        element: <Suspense fallback={Loading}><MyPageLayout /></Suspense>,
        children: mypageRouter
    }
    , {
        path: 'admin',
        element: <Admin />,
        children: adminRouter()
    },
    {
        path: 'signup',
        element: <SignUpPage />,
    }
]);

export default root;