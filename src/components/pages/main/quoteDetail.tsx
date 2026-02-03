import { useEffect, useState } from "react";
import { getQuoteDetailApi, getQuoteDetailResponse } from "../../../apis";
import { cn } from "cn-func";

interface QuoteDetailProps {
  selectedQuoteCode: string;
}

const QuoteDetail = ({ selectedQuoteCode }: QuoteDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState<getQuoteDetailResponse | null>(
    null
  );

  useEffect(() => {
    if (!selectedQuoteCode) {
      setDetailData(null);
      return;
    }

    const fetchQuoteDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getQuoteDetailApi({
          quoteCode: selectedQuoteCode,
        });
        setDetailData(response);
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
        setDetailData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteDetail();
  }, [selectedQuoteCode]);

  if (!selectedQuoteCode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] rounded-[32px] border border-gray-50 min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-[#C9CDD2]">
          <div className="w-20 h-20 border-[6px] border-current rounded-2xl flex items-center justify-center relative text-gray-200">
            <div className="w-1.5 h-10 bg-current rounded-full" />
            <div className="absolute top-3 left-3 w-4 h-1.5 bg-current rounded-full" />
          </div>
          <p className="text-xl font-bold">견적서를 선택해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 p-10 bg-white rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-50 min-h-[600px]">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white border-2 border-blue-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-0.5 bg-blue-primary rounded-full shadow-[0_4px_0_0_#3B82F6,0_-4px_0_0_#3B82F6]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            견적 상세{" "}
            <span className="text-blue-primary font-medium">
              ({selectedQuoteCode})
            </span>
          </h2>
        </div>
        {detailData?.isPhoneActive && (
          <div className="px-5 py-2 bg-[#EBF2FF] text-blue-primary rounded-xl text-sm font-bold">
            개통완료
          </div>
        )}
      </div>

      {/* 유효기간 배너 */}
      <div className="w-full py-4 bg-[#F0F5FF] text-[#4A72FF] rounded-2xl text-center font-bold text-lg">
        유효기간: 2025. 11. 25. 17:00
      </div>

      <div className="grid grid-cols-2 gap-x-16 gap-y-10">
        {/* 왼쪽: 고객정보 */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-black mb-2">고객정보</h3>
          <div className="flex flex-col gap-4">
            <DetailRow label="성명" value={detailData?.customerName} />
            <DetailRow label="연락처" value="010-5723-1548" />
            <DetailRow label="이메일" value={detailData?.customerEmail} />
          </div>
        </div>

        {/* 오른쪽: 가입정보 */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-black mb-2">가입정보</h3>
          <div className="flex flex-col gap-4">
            <DetailRow
              label="기종"
              value={`${detailData?.phoneName} ${detailData?.phoneVolume}`}
            />
            <DetailRow label="유형" value={detailData?.subscriptionType} />
            <DetailRow label="요금" value={detailData?.phonePlanName} />
            <DetailRow
              label="공통 지원금"
              value={`${detailData?.subsidyByTelecom.toLocaleString()}원`}
              isSmall
            />
            <DetailRow
              label="추가지원금"
              value={`${detailData?.subsidyByAgency.toLocaleString()}원`}
              isSmall
            />
            <DetailRow
              label="최종 가격"
              value={`${detailData?.price.toLocaleString()}원`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 행 컴포넌트
const DetailRow = ({
  label,
  value,
  isSmall,
}: {
  label: string;
  value?: string;
  isSmall?: boolean;
}) => (
  <div className="flex items-center gap-5">
    {/* 라벨은 왼쪽에 고정 */}
    <span className="w-20 text-lg font-bold text-gray-800 whitespace-nowrap">
      {label}
    </span>

    {/* 박스 컨테이너: justify-end를 추가하여 내부 박스를 오른쪽으로 밀어냄 */}
    <div className="flex-1 flex justify-end">
      <div
        className={cn(
          "px-5 py-3.5 bg-white border border-[#F1F3F5] rounded-2xl text-gray-700 text-base shadow-sm truncate",
          // isSmall일 때 5/6 사이즈, 아닐 때 100% 사이즈
          isSmall ? "w-5/6" : "w-full"
        )}
      >
        {value || "-"}
      </div>
    </div>
  </div>
);

export default QuoteDetail;
