import { SignInPage } from "@toolpad/core/SignInPage";
import LoginComponent from "../layout/component/users/LoginComponent";

const LoginPage = () => {
  return (
    <div className='fixed top-0 left-0 z-[1055] flex flex-col h-full w-full'>
      <div className="flex flex-wrap w-full h-full justify-center items-center border-2">
        <LoginComponent />
      </div>
    </div>
  );
};

export default LoginPage;