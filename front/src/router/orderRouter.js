import { lazy, Suspense } from "react";
const Loading = <div>Loading 중....</div>
const OrderComponent = lazy(() => import("../layout/component/order/OrderComponent"));
const Order = lazy(() => import("../pages/OrderPage"));
const orderRouter = {
    path: "",
    element: <Suspense fallback={Loading}><Order /></Suspense>,
    children: [
        {
            index: true,
            element: <Suspense fallback={Loading}><OrderComponent /></Suspense>
        }
    ]

}

export default orderRouter