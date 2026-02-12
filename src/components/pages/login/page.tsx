import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 이동 로직을 위해 추가
import loginParter from "../../../assets/loginParter.png";
import modalLogo from "../../../assets/modalLogo.png";
import idInput from "../../../assets/idInput.svg";
import passwordInput from "../../../assets/passwordInput.svg";
import { agencyLoginApi } from "../../../apis"; // API 함수 임포트

const LoginPage = () => {
  const navigate = useNavigate();

  // 1. 로직 추출: 데이터 상태 관리
  const [formData, setFormData] = useState({ id: "", password: "" });

  // 2. 로직 추출: 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. 로직 추출: 로그인 제출 핸들러 (user_id/password 형식 반영)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 요청하신 데이터 형식 { user_id, password } 반영
      const response = await agencyLoginApi({
        userId: formData.id,
        password: formData.password,
      });

      // 서버 응답 키 'authToken' 확인 로직 반영
      if (response && response.authToken) {
        localStorage.setItem("accessToken", response.authToken);
        alert("로그인에 성공했습니다!");
        navigate("/"); // 메인으로 이동
      } else {
        alert("로그인 응답 형식이 잘못되었습니다.");
      }
    } catch (error: any) {
      console.error("로그인 에러:", error);
      alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] font-['Pretendard_Variable']">
      {/* Frame 1514: 메인 컨테이너 (1040x580) - 디자인 유지 */}
      <div className="relative flex h-[580px] w-[1040px] items-center overflow-hidden shadow-[inset_1px_1px_1px_rgba(212,234,247,0.6)] drop-shadow-[1px_2px_4px_rgba(0,0,0,0.05)]">
        {/* Frame 1488: 좌측 섹션 - 디자인 유지 */}
        <div className="flex h-[580px] w-[520px] flex-col items-center justify-center border-y border-l border-[#E2E6EC] bg-[#FFFEFB] px-10 shadow-[inset_0px_-2px_2px_rgba(0,0,0,0.1)] rounded-l-[24px] z-10">
          <div className="mb-[20px] flex w-[437px] flex-col items-center gap-[16px]">
            <img
              src={modalLogo}
              alt="LOGO"
              className="h-[77px] w-[140px] object-contain"
            />
            <p className="w-[437px] text-center text-[16px] font-normal leading-[24px] tracking-[-0.01em] text-[#A0A6AD]">
              로그인 후 스마트폰 판매에 필요한 모든 기능을 누리세요!
            </p>
          </div>

          {/* Form에 handleSubmit 연결 */}
          <form
            className="flex w-[440px] flex-col gap-[16px]"
            onSubmit={handleSubmit}
          >
            {/* 아이디 입력: Frame 1481 스타일 유지 */}
            <div className="flex h-[56px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px] py-[16px]">
              <img
                src={idInput}
                alt="account_circle"
                className="h-[20px] w-[20px]"
              />
              <input
                name="id"
                type="text"
                value={formData.id}
                onChange={handleChange}
                placeholder="아이디"
                className="flex-1 bg-transparent text-[16px] font-light leading-[24px] text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                required
              />
            </div>

            {/* 비밀번호 입력: Frame 1485 스타일 유지 */}
            <div className="flex h-[56px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px] py-[16px]">
              <img
                src={passwordInput}
                alt="lock"
                className="h-[20px] w-[20px] object-contain"
              />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호"
                className="flex-1 bg-transparent text-[16px] font-light leading-[24px] text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                required
              />
            </div>

            {/* 로그인 버튼: 디자인 수치 반영 (텍스트 20px) */}
            <div className="mt-[8px] flex h-[72px] w-[440px] flex-col">
              <button
                type="submit"
                className="flex h-[56px] w-[440px] items-center justify-center rounded-[12px] bg-[#3572EF] px-[20px] py-[16px] text-[20px] font-semibold leading-[24px] text-[#FFFEFB] transition-all hover:opacity-90 active:scale-[0.99]"
              >
                로그인
              </button>
            </div>
          </form>

          {/* 하단 링크 영역: 디자인 유지 (16px 상향 반영) */}
          <div className="flex h-[24px] w-[440px] items-center justify-between px-[8px]">
            <button
              type="button"
              onClick={() => navigate("/register")} // Added navigation
              className="text-[16px] font-normal leading-[24px] text-[#B7BEC8] hover:text-[#3572EF]"
            >
              회원가입
            </button>
            <button
              type="button"
              className="text-[16px] font-normal leading-[24px] text-[#B7BEC8] hover:text-[#3572EF]"
            >
              아이디 · 비밀번호 찾기
            </button>
          </div>
        </div>

        {/* 우측 이미지 섹션: 디자인 유지 (object-fill) */}
        <div className="relative h-[580px] w-[520px] overflow-hidden border-y border-r border-[#E2E6EC] rounded-r-[24px]">
          <img
            src={loginParter}
            alt="BG"
            className="h-full w-full object-fill"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
