import { cn } from "cn-func";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navigationLinks = [
  { name: "메인페이지", href: "/main" },
  { name: "아이폰 가격표 등록", href: "/quote/iphone" },
  { name: "갤럭시 가격표 등록", href: "/quote/galaxy" },
];

interface NavBarProps {
  isOpen: boolean;
  close: () => void;
}

const NavBar = ({ isOpen, close }: NavBarProps) => {
  // 지금 경로랑 같으면 파랗게
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    if (location.pathname === href) return;
    navigate(href);
    close();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-110" onClick={close} />}
      <nav
        className={cn(
          "fixed top-0 left-0 bottom-0 z-120",
          "w-[22.5rem] h-full px-6 py-7 bg-[#FFFEFB] shadow-lg",
          "border-2 border-gray-light rounded-r-[20px]",
          "transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <h2 className="text-3xl  font-semibold">Shop Name</h2>
            <button onClick={close} className="text-gray-light">
              <X size={32} />
            </button>
          </div>
          <div className="border-y border-gray-light rounded-full" />
          <ul className="flex flex-col gap-6 text-[22px] font-medium text-gray-dark">
            {navigationLinks.map((link) => (
              <li
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className={cn(
                  "hover:text-blue-primary duration-200 cursor-pointer",
                  location.pathname === link.href ? "text-blue-primary" : ""
                )}
              >
                {link.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
