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
import { CONTRACT_CLAUSES, Clause } from "./contractData";

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

    // 계약 조항 동의 상태 관리 (1~10조)
    const [agreements, setAgreements] = useState<Record<number, boolean>>({});
    // 현재 계약 페이지 (1: 1-5조, 2: 6-10조)
    const [contractPage, setContractPage] = useState(1);
    // 상세 보기를 위한 선택된 조항
    const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

    const clausesPerPage = 5;
    const currentClauses = useMemo(() => {
        const start = (contractPage - 1) * clausesPerPage;
        return CONTRACT_CLAUSES.slice(start, start + clausesPerPage);
    }, [contractPage]);

    // 전체 동의 여부 계산
    const isAllAgreed = useMemo(() => {
        return CONTRACT_CLAUSES.every(clause => agreements[clause.id]);
    }, [agreements]);

    // 입력 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 동의 핸들러
    const handleToggleAgreement = (clauseId: number, agreed: boolean) => {
        setAgreements(prev => ({ ...prev, [clauseId]: agreed }));
    };

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
            alert("모든 계약 조항에 동의하셔야 회원가입이 가능합니다.");
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

                {/* 우측 섹션: 계약서 동의 */}
                <div className="flex w-[520px] flex-col border-y border-r border-[#E2E6EC] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] px-10 py-12 rounded-r-[24px]">
                    {/* 상단 정보 영역: 좌측 로고/타이틀 높이에 맞춰 여백 조정 */}
                    <div className="mb-[24px] flex h-[108px] flex-col justify-end pb-1">
                        <h2 className="text-[22px] font-extrabold tracking-tight text-[#1E293B]">요정 플랫폼 입점계약서</h2>
                        <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#64748B]">
                            서비스 이용을 위해 아래 모든 조항을 <span className="text-[#3572EF] font-bold">확인하고 동의</span>해주시기 바랍니다.
                        </p>
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                        {currentClauses.map((clause) => (
                            <button
                                key={clause.id}
                                type="button"
                                onClick={() => setSelectedClause(clause)}
                                className={`group flex items-center justify-between rounded-[20px] border px-6 py-5 transition-all duration-300
                                    ${agreements[clause.id] 
                                        ? 'border-[#3572EF] bg-white text-[#3572EF] shadow-[0_8px_20px_rgba(53,114,239,0.12)]' 
                                        : 'border-[#E2E6EC] bg-white/60 text-[#475569] hover:border-[#3572EF]/40 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300
                                        ${agreements[clause.id] 
                                            ? 'bg-[#3572EF] border-[#3572EF] scale-110 shadow-[0_0_10px_rgba(53,114,239,0.3)]' 
                                            : 'border-[#CBD5E1] group-hover:border-[#3572EF]/30'}`}>
                                        {agreements[clause.id] ? (
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-[#CBD5E1] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        )}
                                    </div>
                                    <span className={`text-[16px] font-bold tracking-tight transition-colors ${agreements[clause.id] ? 'text-[#3572EF]' : 'text-[#475569]'}`}>
                                        {clause.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[13px] font-semibold text-[#94A3B8] group-hover:text-[#3572EF] transition-colors">
                                    상세보기
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 페이지네이션 컨트롤 */}
                    <div className="mt-8 flex items-center justify-between border-t border-[#E2E8F0] pt-8">
                        <button 
                            type="button"
                            onClick={() => setContractPage(prev => Math.max(1, prev - 1))}
                            disabled={contractPage === 1}
                            className={`flex h-12 items-center gap-2 rounded-[14px] px-6 text-[15px] font-bold transition-all duration-300
                                ${contractPage === 1 
                                    ? 'text-[#CBD5E1] bg-transparent border border-transparent cursor-not-allowed opacity-50' 
                                    : 'bg-white text-[#334155] shadow-sm hover:bg-[#F8FAFC] border border-[#E2E6EC] hover:border-[#CBD5E1] active:scale-95'}`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            이전
                        </button>
                        
                        <div className="flex items-center gap-2.5">
                            {[1, 2].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setContractPage(p)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${contractPage === p ? 'w-8 bg-[#3572EF]' : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'}`}
                                />
                            ))}
                        </div>

                        <button 
                            type="button"
                            onClick={() => setContractPage(prev => Math.min(2, prev + 1))}
                            disabled={contractPage === 2}
                            className={`flex h-12 items-center gap-2 rounded-[14px] px-6 text-[15px] font-bold transition-all duration-300
                                ${contractPage === 2 
                                    ? 'text-[#CBD5E1] bg-transparent border border-transparent cursor-not-allowed opacity-50' 
                                    : 'bg-[#3572EF] text-white shadow-[0_4px_12px_rgba(53,114,239,0.3)] hover:opacity-90 active:scale-95'}`}
                        >
                            다음
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 계약서 상세 모달 */}
            {selectedClause && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="flex w-full max-w-[600px] flex-col rounded-[24px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-8 py-6">
                            <h3 className="text-[20px] font-bold text-[#1E293B]">{selectedClause.title}</h3>
                            <button 
                                onClick={() => setSelectedClause(null)}
                                className="rounded-full p-1 hover:bg-[#F1F5F9]"
                            >
                                <svg className="h-6 w-6 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="max-h-[50vh] overflow-y-auto px-8 py-6 text-[15px] leading-relaxed text-[#475569] whitespace-pre-line custom-scrollbar">
                            {selectedClause.content}
                        </div>

                        <div className="flex flex-col gap-4 border-t border-[#F1F5F9] bg-[#F8FAFC] px-8 py-6 rounded-b-[24px]">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={agreements[selectedClause.id] || false}
                                        onChange={(e) => handleToggleAgreement(selectedClause.id, e.target.checked)}
                                        className="h-6 w-6 accent-[#3572EF] cursor-pointer"
                                    />
                                </div>
                                <span className="text-[16px] font-bold text-[#1E293B] group-hover:text-[#3572EF]">
                                    해당 조항의 내용을 확인하였으며 동의합니다.
                                </span>
                            </label>
                            
                            <button
                                onClick={() => setSelectedClause(null)}
                                className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#3572EF] text-[16px] font-bold text-white hover:bg-[#2563EB]"
                            >
                                확인
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
