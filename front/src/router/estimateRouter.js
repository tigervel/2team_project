import { lazy, Suspense } from "react";


const GetList = lazy(() => import("../layout/component/estimate/EstimateListComponent"));
const Estimate = lazy(() => import("../layout/component/estimate/EstimateComponent"));
const EstimateMain = lazy(() => import("../pages/EstimatePage"));
const Loading = <div>Loading 중....</div>
const estimateRouter = {
    path: "",
    element: <Suspense fallback={Loading}><EstimateMain /></Suspense>,
    children: [ // ✅ 소문자 children
        {
            path: "list", // ✅ 상대 경로
            element: <Suspense fallback={Loading}><GetList /></Suspense>
        },
        {
            index: true, // ✅ 기본 라우트
            element: <Suspense fallback={Loading}><Estimate /></Suspense>
        }
    ]
};

export default estimateRouter