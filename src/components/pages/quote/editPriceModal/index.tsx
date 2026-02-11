import { useAtomValue, useSetAtom } from "jotai";
import { editPriceModalAtom, EditPriceModalCloseAtom } from "./atom";
import { useState, useMemo, useEffect } from "react";
import { phonePlans, getPlanGroup } from "../../../../contents/phonePlans";
import {
  enrollPriceListApi,
  getPhoneDetailApi,
} from "../../../../apis/priceList";
import { getSubsidy } from "../../../../apis"; // index.ts의 getSubsidy 활용
import { cn } from "cn-func";

const EditPriceModal = () => {
  const { isOpen, device, telecom, option, phoneBrand } =
    useAtomValue(editPriceModalAtom);
  const closeModal = useSetAtom(EditPriceModalCloseAtom);

  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [salesDiscount, setSalesDiscount] = useState("");

  // 서버에서 직접 받아올 데이터 상태
  const [fetchedOriginalPrice, setFetchedOriginalPrice] = useState<number>(0);
  const [fetchedCommonDiscount, setFetchedCommonDiscount] = useState<number>(0);

  /**
   * 모달이 열릴 때: 출고가와 공시지원금을 직접 다시 로드합니다.
   */
  useEffect(() => {
    if (isOpen && device && telecom) {
      const loadModalData = async () => {
        try {
          // 1. 기기 상세(출고가) 조회
          const detailRes = await getPhoneDetailApi({ phoneName: device });
          setFetchedOriginalPrice(detailRes.originalPrice);

          // 2. 공시지원금 조회 (LG U+ 조건 처리)
          const searchTelecom = telecom === "LG U+" ? "LG U" : telecom;
          const subsidyRes = await getSubsidy(searchTelecom);
          setFetchedCommonDiscount(subsidyRes);
        } catch (e) {
          console.error("모달 데이터 로드 실패:", e);
        }
      };

      loadModalData();

      // 입력값 초기화
      setSelectedPlan(null);
      setSalesDiscount("");
    }
  }, [isOpen, device, telecom]);

  const _plans = useMemo(() => {
    return phonePlans[telecom as keyof typeof phonePlans] || [];
  }, [telecom]);

  const discountNumber = useMemo(() => {
    return Number(salesDiscount.replace(/[^0-9]/g, "")) || 0;
  }, [salesDiscount]);

  // 최종 실구매가 계산
  const finalPrice = useMemo(() => {
    return fetchedOriginalPrice - fetchedCommonDiscount - discountNumber;
  }, [fetchedOriginalPrice, fetchedCommonDiscount, discountNumber]);

  const handleSubmit = async () => {
    if (!selectedPlan) return alert("요금제를 선택해주세요.");
    try {
      await enrollPriceListApi({
        phoneBrand,
        phoneName: device,
        phonePlanName: selectedPlan.name,
        telecom,
        subscriptionType: option!.type,
        subsidyByAgency: discountNumber,
      });

      alert("가격이 성공적으로 등록되었습니다.");
      closeModal();
      window.location.reload();
    } catch (e) {
      alert("등록에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
      <div className="relative z-[1001] w-full max-w-[480px] bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
        <h2 className="text-xl font-bold text-center">판매 가격 등록</h2>

        {/* 상단 기기 정보 요약 (Blue 디자인) */}
        <div className="flex justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 py-2 rounded-lg border border-blue-100">
          <span>{device}</span> / <span>{telecom}</span> /{" "}
          <span>{option?.type}</span>
        </div>

        {/* 1. 요금제 선택 구역 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">
            1. 요금제 선택
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-lg bg-white">
            {_plans.map((plan, index) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  "p-2 border rounded-lg text-xs font-medium transition-colors",
                  selectedPlan?.name === plan.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                )}
              >
                {plan.name}
                {getPlanGroup(index) && ` (${getPlanGroup(index)})`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 가격 계산기 구역 (Gray 디자인) */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
          <div className="flex justify-between text-gray-500">
            <span>단말기 출고가</span>
            <span className="font-bold">
              {fetchedOriginalPrice > 0
                ? `${fetchedOriginalPrice.toLocaleString()}원`
                : "조회 중..."}
            </span>
          </div>

          <div className="flex justify-between text-red-500">
            <span>공통 지원금 (-)</span>
            <span className="font-medium">
              {fetchedCommonDiscount > 0
                ? `${fetchedCommonDiscount.toLocaleString()}원`
                : "0원"}
            </span>
          </div>

          <div className="flex justify-between items-center font-medium">
            <span>판매점 지원금 (-)</span>
            <div className="relative">
              <input
                className="border border-gray-300 p-1 rounded w-28 text-right pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="0"
                value={salesDiscount}
                onChange={(e) =>
                  setSalesDiscount(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
              <span className="absolute right-2 top-1.5 text-gray-400 text-xs">
                원
              </span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-blue-600 text-base border-t border-gray-200 pt-3 mt-1">
            <span>최종 실구매가</span>
            <span>{finalPrice.toLocaleString()}원</span>
          </div>
        </div>

        {/* 버튼 구역 */}
        <div className="flex gap-2">
          <button
            className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            onClick={closeModal}
          >
            취소
          </button>
          <button
            className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPriceModal;
