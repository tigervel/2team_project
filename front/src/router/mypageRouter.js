import { lazy, Suspense } from "react";

const Loading = <div>Loading 중....</div>;

const MyInform = lazy(() => import("../pages/mypage/MyInform"));
const EditMyInform = lazy(() => import("../pages/mypage/EditMyInform"));
const EditVehicleInform = lazy(() => import("../pages/mypage/EditVehicleInform"));
const DeliveryInform = lazy(() => import("../pages/mypage/DeliveryInform"));

const mypageRouter = [
  {
    index: true,
    element: <Suspense fallback={Loading}><MyInform /></Suspense>
  },
  {
    path: "edit",
    element: <Suspense fallback={Loading}><EditMyInform /></Suspense>
  },
  {
    path: "vehicle",
    element: <Suspense fallback={Loading}><EditVehicleInform /></Suspense>
  },
  {
    path: "delivery",
    element: <Suspense fallback={Loading}><DeliveryInform /></Suspense>
  }
];

export default mypageRouter;