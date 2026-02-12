import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./pages/main/page";
import NotFoundPage from "./pages/notfound/page";
import DefaultLayout from "./layout/defaultLayout";
import IPhoneQuotePage from "./pages/quote/iphone/page";
import GalaxyQuotePage from "./pages/quote/galaxy/page";
import LoginPage from "./pages/login/page";
import RegisterPage from "./pages/register/page"; // Added import
import QuoteLayout from "./pages/quote/layout";

const Router = () => {
  const isLogin = true;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} /> {/* Added route */}
        <Route path="/" element={<DefaultLayout />}>
          <Route
            index
            element={<Navigate to={isLogin ? "/main" : "/login"} />}
          />
          <Route path="main" element={<MainPage />} />
          <Route path="quote" element={<QuoteLayout />}>
            <Route path="iphone" element={<IPhoneQuotePage />} />
            <Route path="galaxy" element={<GalaxyQuotePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
