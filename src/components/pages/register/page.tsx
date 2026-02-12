import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import modalLogo from "../../../assets/modalLogo.png";
import idInput from "../../../assets/idInput.svg";
import passwordInput from "../../../assets/passwordInput.svg";
import storeInput from "../../../assets/storeInput.svg";
import locationInput from "../../../assets/locationInput.svg";
import phoneInput from "../../../assets/phoneInput.svg";
import emailInput from "../../../assets/emailInput.svg";
import { agencyRegisterApi } from "../../../apis"; 

const RegisterPage = () => {
    const navigate = useNavigate();
    
    // 폼 데이터 상태 관리
    const [formData, setFormData] = useState({
        user_id: "",
        password: "",
        name: "",
        address: "",
        phone_number: "",
        email: ""
    });

    // 입력 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 회원가입 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 간단한 유효성 검사
        if (!formData.user_id || !formData.password || !formData.name || !formData.address || !formData.phone_number || !formData.email) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        try {
            await agencyRegisterApi(formData);
            alert("회원가입이 완료되었습니다.");
            navigate("/login"); 
        } catch (error: any) {
            console.error("회원가입 에러:", error);
            // 에러 메시지 처리 (서버 응답에 따라 다를 수 있음)
            if (error.response?.data?.message) {
                alert(`회원가입 실패: ${error.response.data.message}`);
            } else {
                alert("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] font-['Pretendard_Variable']">
            {/* 메인 컨테이너 (너비 조정됨: 1040px -> 520px) */}
            <div className="relative flex h-[720px] w-[520px] items-center overflow-hidden shadow-[inset_1px_1px_1px_rgba(212,234,247,0.6)] drop-shadow-[1px_2px_4px_rgba(0,0,0,0.05)] rounded-[24px]">
                {/* 단일 섹션 (좌측 섹션 스타일 변경: rounded-l -> rounded, border-y/l -> border) */}
                <div className="flex h-[720px] w-full flex-col items-center justify-center border border-[#E2E6EC] bg-[#FFFEFB] px-10 shadow-[inset_0px_-2px_2px_rgba(0,0,0,0.1)] rounded-[24px] z-10">
                    <div className="mb-[20px] flex w-[437px] flex-col items-center gap-[16px]">
                        <img
                            src={modalLogo}
                            alt="LOGO"
                            className="h-[60px] w-[110px] object-contain"
                        />
                        <p className="w-[437px] text-center text-[16px] font-normal leading-[24px] tracking-[-0.01em] text-[#A0A6AD]">
                            판매점 회원가입
                        </p>
                    </div>

                    <form className="flex w-[440px] flex-col gap-[12px]" onSubmit={handleSubmit}>
                        {/* 아이디 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={idInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="user_id"
                                type="text"
                                value={formData.user_id}
                                onChange={handleChange}
                                placeholder="아이디"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={passwordInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="비밀번호"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 상호명 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={storeInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="판매점 상호명"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 주소 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={locationInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="주소"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 전화번호 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={phoneInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="phone_number"
                                type="text"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="전화번호 (010-0000-0000)"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 이메일 */}
                        <div className="flex h-[50px] w-[440px] items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
                            <img src={emailInput} alt="icon" className="h-[20px] w-[20px]" />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일"
                                className="flex-1 bg-transparent text-[15px] font-light text-[#333333] outline-none placeholder:text-[#B7BEC8]"
                                required
                            />
                        </div>

                        {/* 회원가입 버튼 */}
                        <div className="mt-[16px] flex h-[60px] w-[440px] flex-col">
                            <button
                                type="submit"
                                className="flex h-[56px] w-[440px] items-center justify-center rounded-[12px] bg-[#3572EF] px-[20px] py-[16px] text-[18px] font-semibold text-[#FFFEFB] transition-all hover:opacity-90 active:scale-[0.99]"
                            >
                                가입하기
                            </button>
                        </div>
                    </form>

                    {/* 하단 링크 */}
                    <div className="flex h-[24px] w-[440px] items-center justify-center mt-4">
                        <span className="text-[14px] text-[#B7BEC8] mr-2">이미 계정이 있으신가요?</span>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-[14px] font-medium text-[#3572EF] hover:underline"
                        >
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
