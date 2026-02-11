import { useEffect, useState } from "react";
import { getQuoteDetailApi, getQuoteDetailResponse, updateVisitStatusApi } from "../../../apis";
import { cn } from "cn-func";
import { getPlanGroupByName } from "../../../contents/phonePlans";

interface QuoteDetailProps {
  selectedQuoteCode: string;
  selectedCreateTime: string;
  onStatusUpdate?: () => void;
}

const QuoteDetail = ({ selectedQuoteCode, selectedCreateTime, onStatusUpdate }: QuoteDetailProps) => {
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
        console.log("API Response:", response);
        setDetailData(response);
        console.log("DetailData set to:", response);
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
        setDetailData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteDetail();
  }, [selectedQuoteCode]);

  // Handle "견적 완료" button click
  const handleCompleteQuote = async () => {
    if (!selectedQuoteCode) return;

    try {
      const response = await updateVisitStatusApi({
        authCode: selectedQuoteCode,
        isUserVisit: true,
      });

      if (response.success) {
        alert("견적이 완료되었습니다.");
        // Refresh the quote detail to reflect the updated status
        const updatedDetail = await getQuoteDetailApi({
          quoteCode: selectedQuoteCode,
        });
        setDetailData(updatedDetail);
        // Refresh the status info box
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        alert("견적 완료 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("견적 완료 처리 실패:", error);
      alert("견적 완료 처리 중 오류가 발생했습니다.");
    }
  };

  // detailData 변경 감지
  useEffect(() => {
    console.log("detailData changed:", detailData);
    if (detailData) {
      console.log("phoneName:", detailData.phoneName);
      console.log("phoneVolume:", detailData.phoneVolume);
      console.log("subscriptionType:", detailData.subscriptionType);
    }
  }, [detailData]);

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
      <div className="flex justify-between items-center">
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
        <div className="flex items-center gap-3">
          {!detailData?.isPhoneActivate && (
            <button
              onClick={handleCompleteQuote}
              className="px-6 py-2.5 bg-blue-primary text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
            >
              개통 완료
            </button>
          )}
          {detailData?.isPhoneActivate && (
            <div className="w-[100px] px-6 py-2.5 bg-[#EBF2FF] text-blue-primary rounded-xl text-sm font-bold text-center">
              개통됨
            </div>
          )}
        </div>
      </div>


      {/* 유효기간 배너 */}
      <div className={cn(
        "w-full py-4 rounded-2xl text-center font-bold text-lg",
        (() => {
          // selectedCreateTime이 없으면 detailData의 createTime 사용
          const timeToUse = selectedCreateTime || detailData?.createTime;
          if (!timeToUse) return "bg-[#F0F5FF] text-[#4A72FF]";
          const createDate = new Date(timeToUse);
          const validDate = new Date(createDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const isExpired = now > validDate;
          return isExpired 
            ? "bg-[#F5F6F7] text-[#9EA4AA]" 
            : "bg-[#F0F5FF] text-[#4A72FF]";
        })()
      )}>
        유효기간: {(() => {
          const timeToUse = selectedCreateTime || detailData?.createTime;
          if (!timeToUse) return '-';
          const createDate = new Date(timeToUse);
          const validDate = new Date(createDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const year = validDate.getFullYear();
          const month = String(validDate.getMonth() + 1).padStart(2, '0');
          const day = String(validDate.getDate()).padStart(2, '0');
          const hours = String(validDate.getHours()).padStart(2, '0');
          const minutes = String(validDate.getMinutes()).padStart(2, '0');
          return `${year}. ${month}. ${day}. ${hours}:${minutes}까지`;
        })()}
      </div>


      <div className="grid grid-cols-2 gap-x-16 gap-y-10">
        {/* 왼쪽: 고객정보 */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-black mb-2">고객정보</h3>
          <div className="flex flex-col gap-4">
            <DetailRow label="성명" value={detailData?.customerName} />
            {/* <DetailRow label="연락처" value={detailData?.customerPhoneNumber} /> */}
            <DetailRow label="이메일" value={detailData?.customerEmail} />
          </div>
        </div>

        {/* 오른쪽: 가입정보 */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-black mb-2">가입정보</h3>
          <div className="flex flex-col gap-4">
            <DetailRow
              label="기종"
              value={`${detailData?.phoneName || ''} ${detailData?.phoneVolume || ''}`}
            />
            <DetailRow label="유형" value={detailData?.subscriptionType} />
            <DetailRow
              label="최종 가격"
              value={detailData?.price ? `${detailData.price.toLocaleString()}원` : '-'}
            />
            <DetailRow 
              label="요금" 
              value={detailData?.phonePlanName ? `${detailData.phonePlanName}${getPlanGroupByName(detailData.phonePlanName, detailData.telecom) ? ` (${getPlanGroupByName(detailData.phonePlanName, detailData.telecom)})` : ''}` : '-'} 
            />
            <DetailRow
              label="공통 지원금"
              value={detailData?.subsidyByTelecom ? `${detailData.subsidyByTelecom.toLocaleString()}원` : '-'}
              isSmall
            />
            <DetailRow
              label="추가지원금"
              value={detailData?.subsidyByAgency ? `${detailData.subsidyByAgency.toLocaleString()}원` : '-'}
              isSmall
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
