import { Menu, LogOut } from "lucide-react"; // LogOut 아이콘 추가
import { modalLogo } from "../../assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 이동을 위해 추가
import NavBar from "./navBar";
import { cn } from "cn-func";

const Header = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  // 로그아웃 로직
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken"); // 토큰 삭제
      alert("로그아웃 되었습니다.");
      navigate("/login"); // 로그인 페이지로 이동
    }
  };

  return (
    <>
      <header className="sticky top-0 grid grid-cols-[40px_1fr_40px] items-center w-full h-20 p-5 bg-white shadow-sm z-[100]">
        {/* 1. 왼쪽: 메뉴 버튼 */}
        <button
          className="p-2 text-blue-primary hover:bg-blue-50 rounded-lg transition-colors"
          onClick={toggleMenu}
        >
          <Menu size={24} strokeWidth={3} />
        </button>

        {/* 2. 중앙: 로고 */}
        <div
          className="flex justify-center w-full cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={modalLogo} width={80} height={40} alt="Logo" />
        </div>

        {/* 3. 오른쪽: 로그아웃 버튼 */}
        <button
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          onClick={handleLogout}
          title="로그아웃"
        >
          <LogOut size={24} strokeWidth={2} />
        </button>
      </header>

      {/* 사이드바 메뉴 */}
      <NavBar isOpen={isOpenMenu} close={() => setIsOpenMenu(false)} />
    </>
  );
};

export default Header;
