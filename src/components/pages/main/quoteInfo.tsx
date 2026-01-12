import { getStatusAgencyResponse } from "../../../apis";

interface QuoteInfoProps {
  statusAgency: getStatusAgencyResponse | null;
}

const QuoteInfo = ({ statusAgency }: QuoteInfoProps) => {
  // 데이터가 없을 경우 0으로 표시
  const quoteCount = statusAgency?.quoteCount ?? 0;
  const completeQuoteCount = statusAgency?.completeQuoteCount ?? 0;

  return (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 shadow-md">
      <h2 className="text-xl font-semibold">견적 현황</h2>
      <div className="flex flex-row gap-4">
        <div className="flex-1 flex flex-col items-center gap-2 p-4 bg-blue-tertiary rounded-xl">
          <p className="text-lg font-medium">견적서 발급 현황</p>
          <p className="text-3xl text-blue-primary font-bold">
            {quoteCount.toLocaleString()}건
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 p-4 bg-blue-tertiary rounded-xl">
          <p className="text-lg font-medium">완료된 견적</p>
          <p className="text-3xl text-blue-primary font-bold">
            {completeQuoteCount.toLocaleString()}건
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteInfo;
