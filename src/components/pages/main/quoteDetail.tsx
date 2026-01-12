import { useEffect, useState } from "react";

interface QuoteDetailProps {
  selectedQuoteCode: string;
}

const detailData = {
  quoteCode: "Q20230901-001",
  customerName: "홍길동",
  phone: "010-1234-5678",
  email: "honggildong@example.com",
  validUntil: "2025-11-25 17:00",
  phoneName: "갤럭시 S23 Ultra",
  phoneOriginalPrice: 1450000,
  telecom: "SKT",
  subscriptionType: "번호이동",
  phonePlan: "5G 무제한 요금제",
  commonDiscount: 500000,
  agencyDiscount: 200000,
};

const QuoteDetail = ({ selectedQuoteCode }: QuoteDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);

  isLoading;

  useEffect(() => {
    const fetchQuoteDetail = async () => {
      setIsLoading(true);

      setIsLoading(false);
    };

    fetchQuoteDetail();
  }, [selectedQuoteCode]);

  return (
    <div className="flex-1 flex flex-col gap-4 p-5 bg-white rounded-2xl">
      <h2 className="text-xl font-semibold">견적 상세</h2>
      {selectedQuoteCode ? (
        <div className="flex flex-col gap-4">
          <div className="text-blue-primary p-2 bg-blue-tertiary rounded-lg text-center">
            견적 유효 기간: {detailData.validUntil}
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">고객정보</h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="text-base font-medium">성명</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.customerName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">연락처</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.phone}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">이메일</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.email}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">견적코드</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.quoteCode}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="text-lg font-semibold"></h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="text-base font-medium">기종</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.phoneName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">유형</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">{`${detailData.telecom}(${detailData.subscriptionType})`}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">요금제</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.phonePlan}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">공통 지원금</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.commonDiscount}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-base font-medium">대리점 지원금</span>
                  <span className="px-2 py-1 border border-gray-light rounded-md flex-1 truncate">
                    {detailData.agencyDiscount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          견적 코드를 선택해주세요.
        </div>
      )}
    </div>
  );
};

export default QuoteDetail;
