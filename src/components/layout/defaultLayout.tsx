import { Outlet } from "react-router-dom";
// import Footer from "./footer";

const DefaultLayout = () => {
  return (
    <div className="w-dvw min-h-dvh bg-blue-tertiary">
      <div className="mx-auto max-w-[75rem] min-w-[44rem] min-h-dvh">
        <Outlet />
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default DefaultLayout;
