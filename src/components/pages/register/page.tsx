import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import modalLogo from "../../../assets/modalLogo.png";
import idInput from "../../../assets/idInput.svg";
import passwordInput from "../../../assets/passwordInput.svg";
import storeInput from "../../../assets/storeInput.svg";
import locationInput from "../../../assets/locationInput.svg";
import phoneInput from "../../../assets/phoneInput.svg";
import emailInput from "../../../assets/emailInput.svg";
import { agencyRegisterApi } from "../../../apis"; 
import { TERMS_OF_SERVICE, COMMITMENT_LETTER } from "./contractData";

type AgreementType = 'TERMS' | 'COMMITMENT';

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

    // 메인 동의 상태
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [commitmentAgreed, setCommitmentAgreed] = useState(false);

    // 모달 상태
    const [activeModal, setActiveModal] = useState<AgreementType | null>(null);
    
    // 모달 내 동의 체크박스 상태 (단일 체크박스)
    const [isAgreedInModal, setIsAgreedInModal] = useState(false);

    // 전체 동의 완료 여부
    const isAllAgreed = termsAgreed && commitmentAgreed;

    // 입력 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 모달 열기
    const openModal = (type: AgreementType) => {
        setActiveModal(type);
        // 기존에 동의했으면 체크된 상태로 열림
        if (type === 'TERMS') {
            setIsAgreedInModal(termsAgreed);
        } else {
            setIsAgreedInModal(commitmentAgreed);
        }
    };

    // 모달 확인 버튼 (섹션 완료)
    const handleModalConfirm = () => {
        if (!activeModal) return;
        
        if (activeModal === 'TERMS') {
            setTermsAgreed(isAgreedInModal);
        } else {
            setCommitmentAgreed(isAgreedInModal);
        }
        setActiveModal(null);
    };

    // 모달 닫기
    const closeModal = () => {
        setActiveModal(null);
    };

    // 현재 모달의 조항 데이터
    const currentClauses = useMemo(() => {
        if (activeModal === 'TERMS') return TERMS_OF_SERVICE;
        if (activeModal === 'COMMITMENT') return COMMITMENT_LETTER;
        return [];
    }, [activeModal]);

    // 회원가입 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 간단한 유효성 검사
        if (!formData.user_id || !formData.password || !formData.name || !formData.address || !formData.phone_number || !formData.email) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        // 계약 동의 확인
        if (!isAllAgreed) {
            alert("이용약관과 확약서에 모두 동의하셔야 회원가입이 가능합니다.");
            return;
        }

        try {
            await agencyRegisterApi(formData);
            alert("회원가입이 완료되었습니다.");
            navigate("/login"); 
        } catch (error: any) {
            console.error("회원가입 에러:", error);
            if (error.response?.data?.message) {
                alert(`회원가입 실패: ${error.response.data.message}`);
            } else {
                alert("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] font-['Pretendard_Variable'] py-10">
            {/* 메인 컨테이너 (1040px wide) */}
            <div className="relative flex min-h-[720px] w-[1040px] items-stretch overflow-hidden shadow-[inset_1px_1px_1px_rgba(212,234,247,0.6)] drop-shadow-[1px_2px_4px_rgba(0,0,0,0.05)] rounded-[24px]">
                
                {/* 좌측 섹션: 회원가입 정보 입력 */}
                <div className="flex w-[520px] flex-col items-center justify-center border-y border-l border-[#E2E6EC] bg-[#FFFEFB] px-10 py-12 shadow-[inset_0px_-2px_2px_rgba(0,0,0,0.1)] rounded-l-[24px] z-10">
                    <div className="mb-[24px] flex w-full flex-col items-center gap-[12px]">
                        <img
                            src={modalLogo}
                            alt="LOGO"
                            className="h-[60px] w-[110px] object-contain"
                        />
                        <h1 className="text-[20px] font-bold tracking-[-0.01em] text-[#333333]">판매점 회원가입</h1>
                        <p className="text-[14px] font-normal leading-tight text-[#A0A6AD]">
                            계정 정보를 입력해주세요.
                        </p>
                    </div>

                    <form className="flex w-full flex-col gap-[12px]" onSubmit={handleSubmit}>
                        {/* 아이디 */}
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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
                        <div className="flex h-[52px] w-full items-center gap-[8px] rounded-[12px] bg-[#EDF4FB] px-[20px]">
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

                        <button
                            type="submit"
                            className={`mt-[12px] flex h-[56px] w-full items-center justify-center rounded-[12px] text-[18px] font-semibold text-white transition-all 
                                ${isAllAgreed ? 'bg-[#3572EF] hover:opacity-90 active:scale-[0.98]' : 'bg-[#B7BEC8] cursor-not-allowed'}`}
                        >
                            회원가입 신청
                        </button>
                        
                        <div className="mt-2 flex w-full justify-center">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-[14px] font-normal text-[#B7BEC8] hover:text-[#3572EF]"
                            >
                                이미 계정이 있으신가요? 로그인하기
                            </button>
                        </div>
                    </form>
                </div>

                {/* 우측 섹션: 이용약관 및 확약서 선택 */}
                <div className="flex w-[520px] flex-col border-y border-r border-[#E2E6EC] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] px-10 py-12 rounded-r-[24px]">
                    <div className="mb-[24px] flex h-[108px] flex-col justify-end pb-1">
                        <h2 className="text-[22px] font-extrabold tracking-tight text-[#1E293B]">요정 플랫폼 입점계약</h2>
                        <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#64748B]">
                            아래의 <span className="text-[#3572EF] font-bold">이용약관</span> 및 <span className="text-[#3572EF] font-bold">확약서</span>를 확인 후 동의해주세요.
                        </p>
                    </div>

                    <div className="flex flex-1 flex-col gap-6 justify-center">
                        {/* 이용약관 버튼 */}
                        <button
                            type="button"
                            onClick={() => openModal('TERMS')}
                            className={`group flex h-[160px] w-full flex-col items-center justify-center gap-4 rounded-[24px] border-2 transition-all duration-300
                                ${termsAgreed 
                                    ? 'border-[#3572EF] bg-white shadow-[0_8px_24px_rgba(53,114,239,0.12)]' 
                                    : 'border-[#E2E6EC] bg-white/60 hover:border-[#3572EF]/50 hover:bg-white hover:shadow-lg'}`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                                ${termsAgreed ? 'bg-[#3572EF] text-white scale-110' : 'bg-[#F1F5F9] text-[#94A3B8] group-hover:bg-[#E0F2FE] group-hover:text-[#3572EF]'}`}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-[18px] font-bold ${termsAgreed ? 'text-[#3572EF]' : 'text-[#475569] group-hover:text-[#1E293B]'}`}>
                                    이용약관 동의
                                </span>
                                <span className={`text-[14px] ${termsAgreed ? 'text-[#3572EF]/80' : 'text-[#94A3B8]'}`}>
                                    {termsAgreed ? '동의 완료되었습니다' : '클릭하여 내용 확인'}
                                </span>
                            </div>
                        </button>

                        {/* 확약서 버튼 */}
                        <button
                            type="button"
                            onClick={() => openModal('COMMITMENT')}
                            className={`group flex h-[160px] w-full flex-col items-center justify-center gap-4 rounded-[24px] border-2 transition-all duration-300
                                ${commitmentAgreed 
                                    ? 'border-[#3572EF] bg-white shadow-[0_8px_24px_rgba(53,114,239,0.12)]' 
                                    : 'border-[#E2E6EC] bg-white/60 hover:border-[#3572EF]/50 hover:bg-white hover:shadow-lg'}`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                                ${commitmentAgreed ? 'bg-[#3572EF] text-white scale-110' : 'bg-[#F1F5F9] text-[#94A3B8] group-hover:bg-[#E0F2FE] group-hover:text-[#3572EF]'}`}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-[18px] font-bold ${commitmentAgreed ? 'text-[#3572EF]' : 'text-[#475569] group-hover:text-[#1E293B]'}`}>
                                    개인정보 처리 확약서 동의
                                </span>
                                <span className={`text-[14px] ${commitmentAgreed ? 'text-[#3572EF]/80' : 'text-[#94A3B8]'}`}>
                                    {commitmentAgreed ? '동의 완료되었습니다' : '클릭하여 내용 확인'}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 통합 약관 동의 모달 */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="flex flex-col h-[85vh] w-full max-w-[800px] rounded-[24px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* 모달 헤더 */}
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-8 py-6">
                            <h3 className="text-[22px] font-bold text-[#1E293B]">
                                {activeModal === 'TERMS' ? '이용약관' : '개인정보 처리 및 보호 확약서'}
                            </h3>
                            <button 
                                onClick={closeModal}
                                className="rounded-full p-2 hover:bg-[#F1F5F9] transition-colors"
                            >
                                <svg className="h-6 w-6 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* 약관 내용 영역 */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            <div className="flex flex-col gap-10">
                                {activeModal === 'TERMS' && (
                                    <div className="p-6 bg-[#F8FAFC] rounded-[16px] text-[15px] leading-relaxed text-[#475569] mb-4">
                                        본 계약은 요정 플랫폼에 판매점이 입점하여 서비스를 이용함에 있어 당사자 간의 권리·의무 및 책임 사항을 정함을 목적으로 한다.
                                    </div>
                                )}
                                {activeModal === 'COMMITMENT' && (
                                    <div className="p-6 bg-[#F8FAFC] rounded-[16px] text-[15px] leading-relaxed text-[#475569] mb-4">
                                        본 확약서는 요정 플랫폼과의 입점계약과 관련하여 고객의 개인정보를 제공받아 처리하는 판매점(이하 “확약자”라 한다)이 「개인정보 보호법」 등 관계 법령을 준수할 것을 확약하기 위하여 작성된다.
                                    </div>
                                )}

                                {currentClauses.map((clause) => (
                                    <div key={clause.id} className="flex flex-col gap-3">
                                        <h4 className="text-[17px] font-bold text-[#1E293B] flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#3572EF]"></span>
                                            {clause.title}
                                        </h4>
                                        <div className="pl-3.5 border-l-2 border-[#E2E6EC] ml-[3px]">
                                            <div className="mb-4 text-[15px] leading-relaxed text-[#475569] whitespace-pre-line pl-4">
                                                {clause.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 모달 하단 버튼 */}
                        <div className="flex flex-col gap-4 border-t border-[#F1F5F9] bg-[#F8FAFC] px-8 py-6 rounded-b-[24px]">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-[8px] border transition-all duration-200
                                    ${isAgreedInModal ? 'bg-[#3572EF] border-[#3572EF]' : 'border-[#CBD5E1] bg-white group-hover:border-[#3572EF]'}`}>
                                    {isAgreedInModal && (
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isAgreedInModal}
                                    onChange={() => setIsAgreedInModal(!isAgreedInModal)}
                                    className="hidden"
                                />
                                <span className={`text-[16px] font-bold transition-colors ${isAgreedInModal ? 'text-[#3572EF]' : 'text-[#64748B] group-hover:text-[#334155]'}`}>
                                    위 내용을 모두 확인하였으며 동의합니다.
                                </span>
                            </label>

                            <button
                                onClick={handleModalConfirm}
                                disabled={!isAgreedInModal}
                                className={`flex h-[56px] w-full items-center justify-center rounded-[14px] text-[17px] font-bold text-white transition-all
                                    ${isAgreedInModal 
                                        ? 'bg-[#3572EF] hover:bg-[#2563EB] shadow-lg shadow-[#3572EF]/20 active:scale-[0.99]' 
                                        : 'bg-[#CBD5E1] cursor-not-allowed'}`}
                            >
                                {isAgreedInModal ? '확인' : '동의 항목을 체크해주세요'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
