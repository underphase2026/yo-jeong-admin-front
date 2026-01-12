import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "cn-func";
import { modalLogo } from "../../../assets";
import { agencyLoginApi } from "../../../apis";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("로그인 시도:", formData);

    try {
      const response = await agencyLoginApi({
        userId: formData.id,
        password: formData.password,
      });

      console.log("서버 응답:", response);

      // [수정 포인트] 서버 응답 키가 'authToken'이므로 이를 사용해야 합니다.
      if (response && response.authToken) {
        console.log("인증 토큰 확인 성공:", response.authToken);

        // 로컬 스토리지에 저장 (이름은 'accessToken'으로 유지해도 무관하지만 통일성을 위해 authToken 권장)
        localStorage.setItem("accessToken", response.authToken);

        alert("로그인에 성공했습니다!");
        navigate("/"); // 이제 메인 페이지로 이동합니다.
      } else {
        console.error("응답 데이터에 authToken이 없습니다:", response);
        alert("로그인 응답 형식이 잘못되었습니다.");
      }
    } catch (error: any) {
      console.error("로그인 에러:", error);
      alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center w-dvw min-h-dvh bg-blue-tertiary"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-5 max-w-[574px] w-full p-20 bg-white rounded-[20px] shadow-lg"
        )}
      >
        <img src={modalLogo} alt="Logo" width={208} />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full min-w-80 max-w-[420px] p-6 bg-white border border-gray-light rounded-xl"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">아이디</label>
            <input
              name="id"
              type="text"
              value={formData.id}
              onChange={handleChange}
              placeholder="아이디를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-light rounded-lg outline-none focus:border-blue-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">비밀번호</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-light rounded-lg outline-none focus:border-blue-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-primary text-white p-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
