import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중....</div>
//컴포넌트가 로딩될때까지 메세지를 출력하도록 설정함..
const Main = lazy(() => import("../pages/MainPage"));
//const Login = lazy(() => import("../pages/LoginPage"));
const root = createBrowserRouter([
    //내부에는 객체 형태로 요청에 따른 페이지 설정을 잡아줍니다
    //
    {
        path: "/",
        //지연 로딩을 수행하는 컴포넌트 suspense
        element: <Suspense fallback={Loading}><Main /></Suspense>
    }



]);

export default root;