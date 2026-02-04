import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ArrowIcon from "../../icons/arrow";
import { cn } from "cn-func";
import { getUserListApi, UserItem } from "../../../apis";

interface QuoteListProps {
  selectedQuoteCode: string;
  setSelectedQuoteCode: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCreateTime: React.Dispatch<React.SetStateAction<string>>;
}

const QuoteList = ({
  selectedQuoteCode,
  setSelectedQuoteCode,
  setSelectedCreateTime,
}: QuoteListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5; // 한 페이지에 5명씩

  // getUserList API 호출
  useEffect(() => {
    const fetchUserList = async () => {
      setIsLoading(true);
      try {
        const response = await getUserListApi();
        setUsers(response.users);
        
        // 첫 번째 사용자를 자동 선택
        if (response.users.length > 0) {
          setSelectedQuoteCode(response.users[0].authCode);
          setSelectedCreateTime(response.users[0].createTime);
        }
      } catch (error) {
        console.error("사용자 목록 조회 실패:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserList();
  }, [setSelectedQuoteCode, setSelectedCreateTime]);

  // 1. 검색 필터링 로직
  const filteredUsers = users.filter(
    (user) =>
      user.customerName.includes(searchTerm) ||
      user.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.authCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 검색어가 바뀔 때마다 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 2. 페이지네이션 계산
  const totalPages = Math.max(
    Math.ceil(filteredUsers.length / itemsPerPage),
    1
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 이동 함수
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex flex-col gap-5 w-[420px] p-6 bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 min-h-[600px]">
      {/* 제목 영역 */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-primary rounded-md flex items-center justify-center">
          <div className="w-3 h-0.5 bg-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">발급 견적 현황</h2>
      </div>

      {/* 검색창 */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim()) {
              // 엔터 시 검색어를 견적 코드로 간주하고 직접 조회
              setSelectedQuoteCode(searchTerm.trim());
              // createTime은 리스트에 없을 수 있으므로 빈 문자열 전달
              setSelectedCreateTime('');
            }
          }}
          placeholder="견적 코드를 입력해주세요."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-primary placeholder:text-gray-300 text-sm transition-all"
        />
      </div>

      {/* 견적 리스트 영역 (5명 표시) */}
      <div className="flex flex-col gap-3 h-[460px]">
        {currentItems.length > 0 ? (
          currentItems.map((user) => (
            <div
              key={user.estimateId}
              onClick={() => {
                setSelectedQuoteCode(user.authCode);
                setSelectedCreateTime(user.createTime);
              }}
              className={cn(
                "flex flex-row justify-between items-center px-5 py-4 border rounded-2xl cursor-pointer transition-all",
                selectedQuoteCode === user.authCode
                  ? "border-blue-primary bg-blue-50/40 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-gray-700">
                  {user.customerName} ({user.authCode})
                </p>
                <p className="text-xs text-gray-400">
                  {user.elapsedTime}
                </p>
              </div>

              {/* 방문 여부에 따른 상태 배지 */}
              <div
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold w-20 text-center",
                  user.isUserVisit
                    ? "bg-blue-primary text-white"
                    : "bg-[#EBF2FF] text-blue-primary"
                )}
              >
                {user.isUserVisit ? "완료" : "방문 예정"}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <p>검색 결과가 없습니다.</p>
            {searchTerm && (
              <p className="text-xs text-gray-300">
                ※ 엔터를 누르면 해당 코드로 직접 조회합니다.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 하단 페이지네이션 (직전의 '현재/전체' 방식) */}
      <div className="flex justify-center items-center gap-6 text-gray-dark mt-auto pt-4 border-t border-gray-50">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={cn(
            "p-2 rounded-full transition-colors",
            currentPage === 1
              ? "opacity-20 cursor-not-allowed"
              : "hover:bg-gray-100"
          )}
        >
          <ArrowIcon direction="left" size={18} />
        </button>

        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-blue-primary text-base">{currentPage}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 text-base">{totalPages}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={cn(
            "p-2 rounded-full transition-colors",
            currentPage === totalPages
              ? "opacity-20 cursor-not-allowed"
              : "hover:bg-gray-100"
          )}
        >
          <ArrowIcon direction="right" size={18} />
        </button>
      </div>
    </div>
  );
};

export default QuoteList;
