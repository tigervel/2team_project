import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import ResponsiveAppBar from "../common/ResponsiveAppBar";


const MainPageLayout = () => {

    return (
        <>
            <ResponsiveAppBar/>
        
             <Outlet />
            <Footer/>
        </>
    );
}
export default MainPageLayout;